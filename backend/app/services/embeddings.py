from app.services.ollama_service import ollama_service

class EmbeddingService:
    def get_text_embedding(self, text: str) -> list[float]:
        return ollama_service.get_embedding(text)

embedding_service = EmbeddingService()
