import os
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.document import Document
from app.schemas.document import DocumentResponse
from app.services.rag import rag_service
from app.config import settings
from typing import List

router = APIRouter(prefix="/documents", tags=["documents"])

def background_process_document(doc_id: int):
    # Create a new database session for the background task
    from app.database.connection import SessionLocal
    db = SessionLocal()
    try:
        rag_service.process_document(db, doc_id)
    finally:
        db.close()

@router.post("/upload-document", response_model=DocumentResponse)
def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a document (PDF or Text), save it, and trigger RAG processing in the background.
    """
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in [".pdf", ".txt"]:
        raise HTTPException(status_code=400, detail="Only .pdf and .txt files are supported.")
        
    filename = f"{uuid_filename()}{file_ext}"
    file_path = os.path.join(settings.DOCUMENT_STORAGE_PATH, filename)
    
    with open(file_path, "wb") as f:
        f.write(file.file.read())
        
    doc = Document(
        name=file.filename,
        file_path=file_path,
        status="pending"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    # Process the document asynchronously
    background_tasks.add_task(background_process_document, doc.id)
    
    return doc

@router.get("/", response_model=List[DocumentResponse])
def get_documents(db: Session = Depends(get_db)):
    return db.query(Document).order_by(Document.uploaded_at.desc()).all()

@router.delete("/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Remove from disk
    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception as e:
            pass
            
    db.delete(doc)
    db.commit()
    return {"message": "Document deleted successfully"}

def uuid_filename():
    import uuid
    return uuid.uuid4().hex
