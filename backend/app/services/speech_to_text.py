import logging
import os

logger = logging.getLogger(__name__)

class SpeechToTextService:
    def __init__(self):
        self.model = None

    def _load_model(self):
        if self.model is None:
            try:
                from faster_whisper import WhisperModel
                # Using tiny model for faster local startup, CPU execution by default
                self.model = WhisperModel("tiny", device="cpu", compute_type="int8")
                logger.info("Local faster-whisper (tiny) model loaded successfully.")
            except Exception as e:
                logger.error(f"Failed to load local faster-whisper model: {e}")
                self.model = False

    def transcribe_audio(self, file_path: str) -> str:
        """
        Transcribes audio locally using faster-whisper.
        Falls back to simulation mode if the model fails to load.
        """
        self._load_model()

        if self.model is False or self.model is None:
            logger.info("Using simulated Speech-to-Text transcription.")
            return "Simulated transcription: Hello, how can I learn more about the German quarterly scheduling forms and pricing options?"

        try:
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"Audio file not found at: {file_path}")

            segments, info = self.model.transcribe(file_path, beam_size=1)
            transcription = " ".join([segment.text for segment in segments]).strip()
            return transcription if transcription else "Could not transcribe audio."
        except Exception as e:
            logger.error(f"Error in local faster-whisper transcription: {e}")
            return "Transcription failed due to local inference error."

speech_to_text_service = SpeechToTextService()
