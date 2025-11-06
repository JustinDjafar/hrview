from pydantic import BaseModel
from typing import List

class QuestionInListResponse(BaseModel):
    id_question: int
    question_title: str
    url_video: str

    class Config:
        from_attributes = True

class ListWithQuestionsResponse(BaseModel):
    id_list_question: int
    list_title: str
    minutes: int
    questions: List[QuestionInListResponse]

    class Config:
        from_attributes = True
