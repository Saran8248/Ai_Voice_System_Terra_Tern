from pydantic import BaseModel
from datetime import datetime

class DocumentBase(BaseModel):
    name: str
    file_path: str

class DocumentResponse(DocumentBase):
    id: int
    status: str
    uploaded_at: datetime

    class Config:
        from_attributes = True

class DocumentChunkResponse(BaseModel):
    id: int
    document_id: int
    content: str
    chunk_index: int

    class Config:
        from_attributes = True
