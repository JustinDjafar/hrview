from pydantic import BaseModel
from typing import List, Optional

class QuestionBase(BaseModel):
    id_question : int
    question_title: str
    url_video: str

class QuestionCreate(QuestionBase):
    pass

class QuestionResponse(QuestionBase):
    pass

    class Config:
        from_attributes = True

class AssignedListResponse(BaseModel):
    id_list_question: int
    list_title: str
    questions: List[QuestionResponse]