import logging
import os
from pypdf import PdfReader
from sqlalchemy.orm import Session
from app.models.document import Document, DocumentChunk, Embedding
from app.services.embeddings import embedding_service
from app.services.vector_search import vector_search_service

logger = logging.getLogger(__name__)

class RAGService:
    def extract_text_from_pdf(self, file_path: str) -> str:
        """
        Extracts all text content from a PDF file.
        """
        try:
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text
        except Exception as e:
            logger.error(f"Error reading PDF {file_path}: {e}")
            raise e

    def chunk_text(self, text: str, chunk_size: int = 500, chunk_overlap: int = 100) -> list[str]:
        """
        Splits text into chunks of specified size with overlap.
        """
        words = text.split()
        chunks = []
        
        # Simple word-based chunking
        i = 0
        while i < len(words):
            chunk_words = words[i:i + chunk_size]
            chunks.append(" ".join(chunk_words))
            i += (chunk_size - chunk_overlap)
            
        return chunks

    def process_document(self, db: Session, document_id: int) -> bool:
        """
        Extracts, chunks, embeds, and saves document content.
        """
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            logger.error(f"Document with ID {document_id} not found.")
            return False

        try:
            doc.status = "processing"
            db.commit()

            # Extract
            if doc.file_path.lower().endswith(".pdf"):
                text = self.extract_text_from_pdf(doc.file_path)
            else:
                # Assuming txt or similar
                with open(doc.file_path, "r", encoding="utf-8", errors="ignore") as f:
                    text = f.read()

            if not text.strip():
                raise ValueError("Extracted text is empty")

            # Chunk
            chunks = self.chunk_text(text)
            
            # Save chunks and generate embeddings
            for idx, content in enumerate(chunks):
                db_chunk = DocumentChunk(
                    document_id=doc.id,
                    content=content,
                    chunk_index=idx
                )
                db.add(db_chunk)
                db.flush() # get chunk.id

                # Embed
                vector = embedding_service.get_text_embedding(content)
                db_embedding = Embedding(
                    chunk_id=db_chunk.id,
                    embedding=vector
                )
                db.add(db_embedding)

            doc.status = "completed"
            db.commit()
            logger.info(f"Successfully processed document: {doc.name}")
            return True

        except Exception as e:
            db.rollback()
            doc.status = "failed"
            db.commit()
            logger.error(f"Failed to process document {doc.name}: {e}")
            return False

    def retrieve_context(self, db: Session, query: str, limit: int = 5) -> str:
        """
        Searches similar chunks and compiles them into a single context string.
        """
        chunks = vector_search_service.find_similar_chunks(db, query, limit)
        if not chunks:
            return ""
        return "\n\n---\n\n".join([chunk.content for chunk in chunks])

rag_service = RAGService()
