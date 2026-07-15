from app.services.openai_service import openai_service

class EmbeddingService:
    def get_text_embedding(self, text: str) -> list[float]:
        return openai_service.get_embedding(text)

embedding_service = EmbeddingService()
