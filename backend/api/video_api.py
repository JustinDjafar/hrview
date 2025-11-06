from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from sqlalchemy.orm import Session
from starlette.responses import FileResponse
from controller.auth_controller import get_current_active_user
from models.users import User
from database import get_db
from models.questions import Questions 
from controller.video_controller import (get_hr_video, save_hr_video, 
save_candidate_video, get_candidate_video, list_hr_videos, list_videos_by_user, 
update_hr_video_title, delete_hr_video_by_id, list_all_candidate_answers, delete_candidate_video, get_answers_by_user_and_list)

router = APIRouter(tags=["Video Upload"])

@router.put("/questions/{question_id}")
async def update_hr_video(
    question_id: int,
    title: str = Form(...),
    db: Session = Depends(get_db)
):
    result = await update_hr_video_title(question_id, title, db)
    if not result:
        raise HTTPException(status_code=404, detail="Video not found or failed to update")
    return result

@router.delete("/questions/{question_id}")
async def delete_hr_video(
    question_id: int,
    db: Session = Depends(get_db)
):
    result = await delete_hr_video_by_id(question_id, db)
    if not result:
        raise HTTPException(status_code=404, detail="Video not found or failed to delete")
    return {"message": "Video deleted successfully"}

@router.post("/questions/upload-video")
async def upload_hr_video(
    title : str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    result = await save_hr_video(title, file, db)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to upload HR video")
    return result


@router.post("/answers/upload-video")
async def upload_candidate_answer(
    question_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    filepath, error = await save_candidate_video(current_user.id_user, question_id, file, db)
    if error:
        raise HTTPException(status_code=404, detail=error)
    return {"message": "Answer video uploaded successfully", "file_path": filepath}

# ✅ GET Video HR berdasarkan question_id
@router.get("/questions/{question_id}/video")
def fetch_hr_video(question_id: int, db: Session = Depends(get_db)):
    path, error = get_hr_video(question_id, db)
    if error:
        raise HTTPException(status_code=404, detail=error)
    return FileResponse(path)

# ✅ GET Video kandidat berdasarkan user_id & question_id
@router.get("/answers/video")
def fetch_candidate_video(
    user_id: int,
    question_id: int,
    db: Session = Depends(get_db)
):
    path, error = get_candidate_video(user_id, question_id, db)
    if error:
        raise HTTPException(status_code=404, detail=error)
    return FileResponse(path)

# ✅ List semua video pertanyaan HR
@router.get("/videos/hr")
def get_all_hr_videos(db: Session = Depends(get_db)):
    questions = list_hr_videos(db)
    return [
        {
            "id_question": q.id_question,
            "title": q.question_title,
            "video_url": q.url_video
        }
        for q in questions
    ]

# ✅ List video berdasarkan user_id
@router.get("/videos/kandidat/{user_id}")
def get_videos_by_user(user_id: int, db: Session = Depends(get_db)):
    answers = list_videos_by_user(user_id, db)
    return [
        {
            "answer_id": a.id,
            "user_id": a.user_id,
            "question_id": a.question_id,
            "video_url": a.video_url
        }
        for a in answers
    ]

@router.get("/answers/all")
def get_all_answers(db: Session = Depends(get_db)):
    answers = list_all_candidate_answers(db)
    return [
        {
            "answer_id": a.id,
            "video_url": a.video_url,
            "transcript": a.transcript,
            "user": {
                "id": a.id_user,
                "name": a.name,
                "email": a.email,
            },
            "question": {
                "id": a.id_question,
                "title": a.question_title,
            }
        }
        for a in answers
    ]

@router.delete("/answers/{answer_id}")
async def delete_answer_video(
    answer_id: int,
    db: Session = Depends(get_db)
):
    return {"message": "Video deleted successfully"}

@router.get("/answers/{user_id}/{list_id}")
def get_user_answers_for_list(
    user_id: int,
    list_id: int,
    db: Session = Depends(get_db)
):
    answers = get_answers_by_user_and_list(user_id, list_id, db)
    return [
        {
            "answer_id": a.id,
            "user_id": a.user_id,
            "question_id": a.question_id,
            "video_url": a.video_url
        }
        for a in answers
    ]

