from database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship

class Answer(Base):
    __tablename__ = "answers"
    
    id = Column(Integer, primary_key=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id_user"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id_question"), nullable=False)
    id_list_questions = Column(Integer, ForeignKey("list_questions.id_list_question"), nullable=True)
    video_url = Column(String(512), nullable=False)
    transcript = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="answers")
    question = relationship("Questions")