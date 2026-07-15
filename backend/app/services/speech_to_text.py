import logging
import os
from app.config import settings
from app.services.openai_service import openai_service

logger = logging.getLogger(__name__)

class SpeechToTextService:
    def transcribe_audio(self, file_path: str) -> str:
        """
        Transcribes audio from a local file using OpenAI Whisper API.
        """
        if not openai_service.client:
            logger.info("Operating in Mock Mode for Speech-to-Text transcription.")
            return "This is a simulated transcription from the mock speech-to-text service."

        try:
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"Audio file not found at: {file_path}")

            with open(file_path, "rb") as audio_file:
                transcript = openai_service.client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file
                )
            return transcript.text
        except Exception as e:
            logger.error(f"Error in speech-to-text transcription: {e}")
            return "I couldn't understand the audio. Please speak again."

speech_to_text_service = SpeechToTextService()
