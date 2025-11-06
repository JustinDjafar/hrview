from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from controller import transcript_controller

router = APIRouter(tags=["Transcript"])

@router.post("/transcribe/{answer_id}")
async def transcribe_answer(answer_id: int, db: Session = Depends(get_db)):
    result = await transcript_controller.transcribe_video(answer_id, db)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to start transcription.")
    return result
