from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas.questions import QuestionCreate, QuestionResponse

from controller.question_controller import (
    create_question,
    get_all_questions,
    get_question_by_id
)

router = APIRouter(
    prefix="/questions",
    tags=["Questions"]
)

@router.post("/", response_model=QuestionResponse)
def create_new_question(data: QuestionCreate, db: Session = Depends(get_db)):
    return create_question(db, data)


@router.get("/", response_model=list[QuestionResponse])
def list_questions(db: Session = Depends(get_db)):
    return get_all_questions(db)


@router.get("/{question_id}", response_model=QuestionResponse)
def get_question(question_id: int, db: Session = Depends(get_db)):
    result = get_question_by_id(db, question_id)
    if not result:
        return {"message": "Question not found"}
    return result
