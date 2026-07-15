import logging
import os
import uuid
import subprocess
from app.config import settings

logger = logging.getLogger(__name__)

# A valid tiny 1-second silent audio file in bytes for fallback playability
TINY_SILENT_WAV = (
    b'RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x80\x3e\x00\x00'
    b'\x80\x3e\x00\x00\x01\x00\x08\x00data\x00\x00\x00\x00'
)

class PiperTTSService:
    def __init__(self):
        # Path to piper binary. By default, check if it's on system PATH.
        self.piper_command = "piper"
        self.model_path = os.getenv("PIPER_MODEL_PATH", "en_US-lessac-medium.onnx")
        self.is_available = self._check_piper_available()

        if not self.is_available:
            logger.warning("Piper TTS CLI is not available in PATH. Running with Silent/Cloud fallback.")

    def _check_piper_available(self) -> bool:
        try:
            # Quick check if piper command runs
            subprocess.run([self.piper_command, "--help"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            return True
        except Exception:
            return False

    def synthesize_speech(self, text: str, voice: str = "alloy") -> str:
        """
        Synthesizes text to speech using Piper CLI, outputting to a WAV file.
        Falls back to a playable silent WAV file if Piper is not installed.
        """
        filename = f"tts_{uuid.uuid4().hex}.wav"
        output_path = os.path.join(settings.AUDIO_STORAGE_PATH, filename)

        if not self.is_available:
            logger.info("Using simulated fallback speech file (Piper not found).")
            with open(output_path, "wb") as f:
                f.write(TINY_SILENT_WAV)
            return output_path

        try:
            # Command structure: echo text | piper --model model.onnx --output_file file.wav
            process = subprocess.Popen(
                [self.piper_command, "--model", self.model_path, "--output_file", output_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            stdout, stderr = process.communicate(input=text)
            
            if process.returncode == 0 and os.path.exists(output_path):
                return output_path
                
            logger.error(f"Piper TTS synthesis failed: {stderr}")
            with open(output_path, "wb") as f:
                f.write(TINY_SILENT_WAV)
            return output_path
            
        except Exception as e:
            logger.error(f"Error executing Piper subprocess: {e}")
            with open(output_path, "wb") as f:
                f.write(TINY_SILENT_WAV)
            return output_path

text_to_speech_service = PiperTTSService()
