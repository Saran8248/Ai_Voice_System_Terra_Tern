from sqlalchemy.orm import Session
from app.models.document import DocumentChunk, Embedding
from app.services.embeddings import embedding_service

class VectorSearchService:
    def find_similar_chunks(self, db: Session, query: str, limit: int = 5) -> list[DocumentChunk]:
        """
        Generates embedding for the query and searches the database using cosine similarity.
        """
        query_embedding = embedding_service.get_text_embedding(query)
        
        # Using pgvector cosine_distance operator (<=> in SQL)
        results = (
            db.query(DocumentChunk)
            .join(Embedding)
            .order_by(Embedding.embedding.cosine_distance(query_embedding))
            .limit(limit)
            .all()
        )
        return results

vector_search_service = VectorSearchService()
