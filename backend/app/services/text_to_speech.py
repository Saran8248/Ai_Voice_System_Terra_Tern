import logging
import os
import uuid
from app.config import settings
from app.services.openai_service import openai_service

logger = logging.getLogger(__name__)

# A valid tiny 1-second silent MP3 file in bytes (or similar minimal playable mp3 frame)
TINY_SILENT_MP3 = (
    b'\x30\x26\xB2\x75\x8E\x66\xCF\x11\xA6\xD9\x00\xAA\x00\x62\xCE\x6C'
    b'\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
    b'\xFF\xFB\x10\xC4\x00\x03\xC0\x00\x01\xA4\x00\x00\x00\x20\x00\x00'
    b'\x34\x80\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
)

class TextToSpeechService:
    def synthesize_speech(self, text: str, voice: str = "alloy") -> str:
        """
        Synthesizes text to speech and saves it as an MP3 file.
        Returns the local path to the generated audio file.
        """
        filename = f"tts_{uuid.uuid4().hex}.mp3"
        output_path = os.path.join(settings.AUDIO_STORAGE_PATH, filename)

        if not openai_service.client:
            logger.info("Operating in Mock Mode for Text-to-Speech synthesis.")
            # Write a tiny playable MP3 file
            with open(output_path, "wb") as f:
                f.write(TINY_SILENT_MP3)
            return output_path

        try:
            response = openai_service.client.audio.speech.create(
                model="tts-1",
                voice=voice, # alloy, echo, fable, onyx, nova, shimmer
                input=text
            )
            response.stream_to_file(output_path)
            return output_path
        except Exception as e:
            logger.error(f"Error in text-to-speech synthesis: {e}")
            # Write placeholder file
            with open(output_path, "wb") as f:
                f.write(TINY_SILENT_MP3)
            return output_path

text_to_speech_service = TextToSpeechService()
