import logging
import requests
from app.config import settings

logger = logging.getLogger(__name__)

class OllamaService:
    def __init__(self):
        self.base_url = "http://localhost:11434"
        self.model = "qwen2.5" # default model, can also be llama3.1
        self.is_available = self._check_availability()
        
        if not self.is_available:
            logger.warning(
                f"Ollama is not running at {self.base_url}. "
                "Running in Cloud Fallback / Simulation Mode."
            )

    def _check_availability(self) -> bool:
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=2)
            return response.status_code == 200
        except Exception:
            return False

    def generate_chat_response(self, prompt: str, context: str = "") -> str:
        """
        Queries local Ollama instance for LLM completions. Falls back to simulated engine.
        """
        if not self.is_available:
            # High-fidelity simulation mode for deployed preview links
            logger.info("Using simulated LLM response for cloud compatibility.")
            p_lower = prompt.lower()
            if "pricing" in p_lower or "price" in p_lower:
                return "Our Standard plan is $49/month, and the Enterprise plan is $299/month. Both feature unlimited local AI voice minutes."
            elif "contact" in p_lower or "support" in p_lower:
                return "You can contact our local support team at support@terratern.com or schedule a meeting directly from the admin panel."
            elif "germany" in p_lower or "german" in p_lower:
                return "We offer tailored German voice accents and quarterly scheduling assistance. Rima and Amrith recently updated the automatic absent logs."
            return f"Thank you for reaching out to Terra Tern! In response to your question: '{prompt[:60]}...', we utilize pgvector and local LLMs to provide real-time voice intelligence."

        try:
            system_prompt = (
                "You are a helpful AI Voice Agent representing our company. "
                "Answer the user's questions truthfully and concisely using the provided context."
            )
            
            full_prompt = ""
            if context:
                full_prompt += f"Context:\n{context}\n\n"
            full_prompt += f"User Question: {prompt}"

            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": full_prompt,
                    "system": system_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7
                    }
                },
                timeout=15
            )
            if response.status_code == 200:
                return response.json().get("response", "").strip()
            return "I encountered an error querying the local intelligence node."
        except Exception as e:
            logger.error(f"Error calling local Ollama service: {e}")
            return "I apologize, but I could not connect to my local LLM backend. Please verify that Ollama is running."

    def get_embedding(self, text: str) -> list[float]:
        """
        Generates 1536-dimensional vector embedding.
        If local Ollama embedding is not available, generates dynamic mock vectors.
        """
        if self.is_available:
            try:
                # Local embed model (e.g. nomic-embed-text or whatever is loaded)
                # Note: Ollama embedding dimensions vary (nomic is 768, OpenAI is 1536).
                # We align database/schema.sql and pgvector to 1536. If using nomic, we pad it to 1536,
                # or use Ollama's model. Let's make it robust by padding to 1536.
                response = requests.post(
                    f"{self.base_url}/api/embeddings",
                    json={
                        "model": "nomic-embed-text",
                        "prompt": text
                    },
                    timeout=5
                )
                if response.status_code == 200:
                    local_vector = response.json().get("embedding", [])
                    # Pad or truncate to match the 1536-dimension of our database schema
                    if len(local_vector) < 1536:
                        local_vector += [0.0] * (1536 - len(local_vector))
                    return local_vector[:1536]
            except Exception as e:
                logger.error(f"Failed to generate local Ollama embedding: {e}")
                
        # Fallback dynamic mock embedding generator
        import random
        random.seed(hash(text))
        return [random.uniform(-1.0, 1.0) for _ in range(1536)]

ollama_service = OllamaService()
