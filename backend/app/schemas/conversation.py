from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional

class MessageBase(BaseModel):
    sender: str
    text_content: str
    audio_path: Optional[str] = None
    latency_ms: Optional[int] = None

class MessageResponse(MessageBase):
    id: int
    conversation_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationBase(BaseModel):
    title: str

class ConversationResponse(ConversationBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True

class FeedbackCreate(BaseModel):
    conversation_id: int
    rating: int
    comment: Optional[str] = None

class FeedbackResponse(FeedbackCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class AppointmentCreate(BaseModel):
    user_name: str
    user_email: EmailStr
    appointment_time: datetime

class AppointmentResponse(AppointmentCreate):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
