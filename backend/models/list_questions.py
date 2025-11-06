from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class ListQuestions(Base):
    __tablename__ = "list_questions"

    id_list_question = Column(Integer, primary_key=True, index=True, nullable=False)
    list_title = Column(Text, nullable=False)
    minutes = Column(Integer, nullable=True)

    questions = relationship(
        "Questions",
        secondary="list_question_items",
        back_populates="lists"
    )
    assigned_users = relationship("User", back_populates="assigned_list")


class ListQuestionItems(Base):
    __tablename__ = "list_question_items"

    id_lqi = Column(Integer, primary_key=True, index=True, nullable=False)
    list_id = Column(Integer, ForeignKey("list_questions.id_list_question"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id_question"), nullable=False)

