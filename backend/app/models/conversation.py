from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Numeric, func
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), default="New Conversation")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="conversation", cascade="all, delete-orphan")

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    conversation = relationship("Conversation", back_populates="feedbacks")

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String(255), nullable=False)
    user_email = Column(String(255), nullable=False)
    appointment_time = Column(DateTime, nullable=False)
    status = Column(String(50), default="scheduled")
    created_at = Column(DateTime, server_default=func.now())

class Analytics(Base):
    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String(100), nullable=False)
    metric_value = Column(Numeric, nullable=False)
    recorded_at = Column(DateTime, server_default=func.now())
