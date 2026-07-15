import logging
from openai import OpenAI
from app.config import settings

logger = logging.getLogger(__name__)

class OpenAIService:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        if self.api_key:
            self.client = OpenAI(api_key=self.api_key)
        else:
            self.client = None
            logger.warning("OPENAI_API_KEY is not configured. OpenAI service will operate in mock mode.")

    def generate_chat_response(self, prompt: str, context: str = "") -> str:
        """
        Generate a text response using GPT-4o-mini/GPT-4.
        """
        if not self.client:
            # Mock mode response
            logger.info("Operating in Mock Mode for LLM response.")
            if "pricing" in prompt.lower() or "price" in prompt.lower():
                return "Our Standard plan starts at $49/month, and our Enterprise plan starts at $299/month. Both plans offer unlimited AI voice minutes."
            elif "contact" in prompt.lower() or "support" in prompt.lower():
                return "You can contact our support team at support@terratern.com or schedule an appointment via our dashboard."
            return f"Thank you for asking. Based on our company documents: {prompt[:50]}... We are dedicated to providing the best AI Voice Agent solutions globally."

        try:
            messages = []
            if context:
                messages.append({
                    "role": "system",
                    "content": f"You are a helpful AI Voice Agent representing our company. Use the following document context to answer the user's questions truthfully and concisely. Context:\n\n{context}"
                })
            else:
                messages.append({
                    "role": "system",
                    "content": "You are a helpful AI Voice Agent representing our company. Answer the user's questions truthfully and concisely."
                })
                
            messages.append({"role": "user", "content": prompt})

            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                max_tokens=250,
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Error in generating LLM response: {e}")
            return "I apologize, but I encountered an error while processing your request. Please try again."

    def get_embedding(self, text: str) -> list[float]:
        """
        Generate a vector embedding for a piece of text.
        """
        if not self.client:
            # Mock mode 1536-dim embedding vector
            import random
            random.seed(hash(text))
            return [random.uniform(-1.0, 1.0) for _ in range(1536)]

        try:
            response = self.client.embeddings.create(
                model="text-embedding-3-small",
                input=[text]
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            # fallback mock embedding
            import random
            random.seed(hash(text))
            return [random.uniform(-1.0, 1.0) for _ in range(1536)]

openai_service = OpenAIService()
