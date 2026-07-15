import time
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.conversation import Conversation, Feedback, Appointment
from app.models.message import Message
from app.schemas.conversation import (
    ConversationResponse, MessageResponse, FeedbackCreate, FeedbackResponse,
    AppointmentCreate, AppointmentResponse
)
from app.services.rag import rag_service
from app.services.ollama_service import ollama_service
from app.services.email_service import email_service
from typing import List

router = APIRouter(prefix="/chat", tags=["chat"])

@router.get("/conversations", response_model=List[ConversationResponse])
def get_conversations(db: Session = Depends(get_db)):
    # Simple list of all conversations for dashboard
    return db.query(Conversation).order_by(Conversation.updated_at.desc()).all()

@router.post("/conversations", response_model=ConversationResponse)
def create_conversation(db: Session = Depends(get_db)):
    conv = Conversation(title="New Voice Agent Session")
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv

@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
def get_conversation(conversation_id: int, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv

class ChatRequest(ConversationResponse):
    pass

@router.post("/message")
def send_chat_message(conversation_id: int, text_content: str, db: Session = Depends(get_db)):
    # 1. Start timer
    start_time = time.time()
    
    # 2. Verify conversation exists
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    # 3. Save User Message
    user_msg = Message(
        conversation_id=conversation_id,
        sender="user",
        text_content=text_content
    )
    db.add(user_msg)
    db.flush()
    
    # 4. RAG - Retrieve relative context
    context = rag_service.retrieve_context(db, text_content, limit=3)
    
    # 5. Call LLM
    response_text = ollama_service.generate_chat_response(text_content, context)
    
    # 6. Calculate Latency
    latency_ms = int((time.time() - start_time) * 1000)
    
    # 7. Save Assistant Message
    assistant_msg = Message(
        conversation_id=conversation_id,
        sender="assistant",
        text_content=response_text,
        latency_ms=latency_ms
    )
    db.add(assistant_msg)
    
    # Update conversation updated timestamp
    conv.title = text_content[:40] + "..." if len(text_content) > 40 else text_content
    db.commit()
    db.refresh(assistant_msg)
    
    return {
        "user_message": {
            "id": user_msg.id,
            "sender": user_msg.sender,
            "text_content": user_msg.text_content,
            "created_at": user_msg.created_at
        },
        "assistant_message": {
            "id": assistant_msg.id,
            "sender": assistant_msg.sender,
            "text_content": assistant_msg.text_content,
            "latency_ms": assistant_msg.latency_ms,
            "created_at": assistant_msg.created_at
        }
    }

@router.post("/feedback", response_model=FeedbackResponse)
def submit_feedback(fb: FeedbackCreate, db: Session = Depends(get_db)):
    db_fb = Feedback(
        conversation_id=fb.conversation_id,
        rating=fb.rating,
        comment=fb.comment
    )
    db.add(db_fb)
    db.commit()
    db.refresh(db_fb)
    return db_fb

@router.post("/appointments", response_model=AppointmentResponse)
def schedule_appointment(apt: AppointmentCreate, db: Session = Depends(get_db)):
    db_apt = Appointment(
        user_name=apt.user_name,
        user_email=apt.user_email,
        appointment_time=apt.appointment_time
    )
    db.add(db_apt)
    db.commit()
    db.refresh(db_apt)
    
    # Send confirmation email
    email_service.send_appointment_confirmation(
        apt.user_email,
        apt.user_name,
        apt.appointment_time.strftime("%Y-%m-%d %H:%M")
    )
    
    return db_apt
