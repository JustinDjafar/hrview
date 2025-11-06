from sqlalchemy.orm import Session
from models.list_questions import ListQuestions, ListQuestionItems
from models.questions import Questions
from schemas.lists import ListCreate, AddQuestionsToList
from typing import List


def create_list_with_videos(db: Session, data: ListCreate):
    new_list = ListQuestions(list_title=data.list_title, minutes=data.minutes)
    db.add(new_list)
    db.commit()
    db.refresh(new_list)

    for vid in data.video_ids:
        db.add(
            ListQuestionItems(
                list_id=new_list.id_list_question,
                question_id=vid
            )
        )

    db.commit()
    return {
        "id": new_list.id_list_question,
        "name": new_list.list_title,
        "videos_added": len(data.video_ids)
    }


def get_questions_in_list(db: Session, list_id: int):
    return (
        db.query(Questions)
        .join(ListQuestionItems, ListQuestionItems.question_id == Questions.id_question)
        .filter(ListQuestionItems.list_id == list_id)
        .all()
    )

def update_list_with_videos(db: Session, list_id: int, data: ListCreate):
    # Cari list yang akan diupdate
    list_to_update = db.query(ListQuestions).filter(
        ListQuestions.id_list_question == list_id
    ).first()
    
    if not list_to_update:
        return None
    
    # Update title
    list_to_update.list_title = data.list_title
    list_to_update.minutes = data.minutes
    
    # Hapus semua video lama dari list
    db.query(ListQuestionItems).filter(
        ListQuestionItems.list_id == list_id
    ).delete()
    
    # Tambahkan video baru
    for vid in data.video_ids:
        db.add(
            ListQuestionItems(
                list_id=list_id,
                question_id=vid
            )
        )
    
    db.commit()
    db.refresh(list_to_update)
    
    return {
        "id_list_question": list_to_update.id_list_question,
        "list_title": list_to_update.list_title,
        "videos_updated": len(data.video_ids)
    }


def delete_list(db: Session, list_id: int):
    # Hapus semua items dalam list terlebih dahulu
    db.query(ListQuestionItems).filter(
        ListQuestionItems.list_id == list_id
    ).delete()
    
    # Hapus list
    list_to_delete = db.query(ListQuestions).filter(
        ListQuestions.id_list_question == list_id
    ).first()
    
    if not list_to_delete:
        return None
    
    db.delete(list_to_delete)
    db.commit()
    
    return {"message": "List berhasil dihapus", "id": list_id}