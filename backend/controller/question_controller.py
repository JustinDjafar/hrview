from sqlalchemy.orm import Session
from models.questions import Questions
from schemas.questions import QuestionCreate


def create_question(db: Session, question_data: QuestionCreate):
    new_question = Questions(
        question_title=question_data.question_title,
        question_text=question_data.question_text,
        url_video=question_data.url_video,
    )
    db.add(new_question)
    db.commit()
    db.refresh(new_question)
    return new_question


def get_all_questions(db: Session):
    return db.query(Questions).all()


def get_question_by_id(db: Session, question_id: int):
    return db.query(Questions).filter(Questions.id_question == question_id).first()
