from pydantic import BaseModel
from typing import List, Optional

# Schema dasar (dipakai ulang)
class ListBase(BaseModel):
    list_title: str  # contoh: "Backend Engineer Interview"
    minutes: Optional[int] = None

# Schema untuk input saat membuat list baru (POST /lists)
class ListCreate(ListBase):
    video_ids: List[int]  # contoh: [1, 2, 3]

# Schema untuk response (GET)
class ListResponse(ListBase):
    id_list_question: int
    minutes: Optional[int] = None

    class Config:
        from_attributes = True  # agar bisa baca dari SQLAlchemy model

# Schema untuk menambahkan pertanyaan ke list tertentu
class AddQuestionsToList(BaseModel):
    video_ids: List[int]  # disamakan dengan field di atas