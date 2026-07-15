import os
import logging
from fastapi import APIRouter, Depends, Form, Response
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.conversation import Conversation
from app.models.message import Message
from app.services.rag import rag_service
from app.services.ollama_service import ollama_service
from app.services.text_to_speech import text_to_speech_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/telephony", tags=["telephony"])

@router.api_route("/incoming", methods=["GET", "POST"])
def handle_incoming_call(db: Session = Depends(get_db)):
    """
    Twilio Webhook: Initial entry point when a caller dials our number.
    Returns TwiML instructing Twilio to greet the user and gather their spoken input.
    """
    # Create a new conversation session for this phone call
    conv = Conversation(title="Incoming Telephony Call")
    db.add(conv)
    db.commit()
    db.refresh(conv)

    # Construct TwiML response
    # We ask the user a question and gather their speech.
    # The 'action' attribute directs Twilio to POST the speech transcription to our /respond endpoint.
    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joey-Neural">Hello! Welcome to the Terra Tern voice portal. How can I assist you today?</Say>
    <Gather input="speech" action="/api/telephony/respond?conversation_id={conv.id}" speechTimeout="auto">
        <Say>Please speak your question after the beep.</Say>
    </Gather>
    <Say>We did not receive any input. Thank you for calling Terra Tern. Goodbye.</Say>
    <Hangup/>
</Response>
"""
    return Response(content=twiml, media_type="application/xml")


@router.api_route("/respond", methods=["GET", "POST"])
def handle_caller_response(
    conversation_id: int,
    SpeechResult: str = Form(None),
    db: Session = Depends(get_db)
):
    """
    Twilio Callback: Receives the transcribed speech, queries RAG + LLM,
    synthesizes response audio, and plays it back to the caller while continuing the loop.
    """
    # 1. Fallback if Twilio fails to transcribe anything
    if not SpeechResult:
        twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joey-Neural">I'm sorry, I didn't catch that. Could you please repeat your question?</Say>
    <Gather input="speech" action="/api/telephony/respond?conversation_id={conversation_id}" speechTimeout="auto">
    </Gather>
    <Hangup/>
</Response>
"""
        return Response(content=twiml, media_type="application/xml")

    # 2. Record caller's transcription
    user_msg = Message(
        conversation_id=conversation_id,
        sender="user",
        text_content=SpeechResult
    )
    db.add(user_msg)
    db.flush()

    # 3. Retrieve context & query local LLM (Ollama)
    context = rag_service.retrieve_context(db, SpeechResult, limit=2)
    ai_response_text = ollama_service.generate_chat_response(SpeechResult, context)

    # 4. Generate local audio synthesis (Piper TTS)
    audio_file_path = text_to_speech_service.synthesize_speech(ai_response_text)
    filename = os.path.basename(audio_file_path)
    
    # In production, this should point to your public server domain (e.g. Render)
    # E.g. https://your-render-domain.com/static/audio/filename
    public_audio_url = f"/static/audio/{filename}"

    # 5. Record agent message
    agent_msg = Message(
        conversation_id=conversation_id,
        sender="assistant",
        text_content=ai_response_text,
        audio_path=public_audio_url
    )
    db.add(agent_msg)
    db.commit()

    # 6. Return TwiML to play the synthesized audio response and Gather the next question
    # Note: Twilio plays the audio file, then opens the microphone to gather the caller's next reply.
    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Play>{public_audio_url}</Play>
    <Gather input="speech" action="/api/telephony/respond?conversation_id={conversation_id}" speechTimeout="auto">
    </Gather>
    <Say>Thank you for calling. Goodbye.</Say>
    <Hangup/>
</Response>
"""
    return Response(content=twiml, media_type="application/xml")
