from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Questions(Base):
    __tablename__ = "questions"

    id_question = Column(Integer, primary_key=True, index=True, nullable=False)
    question_title = Column(Text, nullable=False)
    url_video = Column(String(512), nullable=False)
    created_at = Column(String(50), nullable=True)

    lists = relationship(
        "ListQuestions",
        secondary="list_question_items",
        back_populates="questions"
    )