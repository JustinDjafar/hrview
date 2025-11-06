from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db

from controller.list_controller import (
    create_list_with_videos,
    delete_list,
    get_questions_in_list,
    update_list_with_videos
)
from models.list_questions import ListQuestions
from models.questions import Questions
from schemas.lists import  ListCreate, ListResponse, AddQuestionsToList
from schemas.question_list import ListWithQuestionsResponse, QuestionInListResponse
from schemas.questions import QuestionResponse
from sqlalchemy.orm import joinedload

router = APIRouter(
    tags=["Lists"]
)
@router.post("/create")
def create_list(data: ListCreate, db: Session = Depends(get_db)):
    return create_list_with_videos(db, data)

@router.get("/{list_id}/questions", response_model=list[QuestionResponse])
def get_list_questions(list_id: int, db: Session = Depends(get_db)):
    return get_questions_in_list(db, list_id)

@router.get("/lists-all", response_model=List[ListWithQuestionsResponse])
def get_all_lists_with_questions(db: Session = Depends(get_db)):
    lists_data = db.query(ListQuestions).options(joinedload(ListQuestions.questions)).all()
    
    response_lists = []
    for list_item in lists_data:
        questions_in_list = []
        for question in list_item.questions:
            questions_in_list.append(QuestionInListResponse(
                id_question=question.id_question,
                question_title=question.question_title,
                url_video=question.url_video
            ))
        response_lists.append(ListWithQuestionsResponse(
            id_list_question=list_item.id_list_question,
            list_title=list_item.list_title,
            minutes=list_item.minutes,
            questions=questions_in_list
        ))
    return response_lists


@router.put("/{list_id}")
def update_list(list_id: int, data: ListCreate, db: Session = Depends(get_db)):
    result = update_list_with_videos(db, list_id, data)
    if not result:
        raise HTTPException(status_code=404, detail="List tidak ditemukan")
    return result

@router.delete("/{list_id}")
def remove_list(list_id: int, db: Session = Depends(get_db)):
    result = delete_list(db, list_id)
    if not result:
        raise HTTPException(status_code=404, detail="List tidak ditemukan")
    return result
