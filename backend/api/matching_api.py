from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from controller import matching_controller
from controller.auth_controller import admin_required

router = APIRouter(tags=["Matching"])

@router.get("/score/{job_id}/{user_id}")
async def get_matching_score(
    job_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    # current_user: User = Depends(admin_required) # Only admin can access this for now
):
    score, error = await matching_controller.get_job_matching_score(job_id, user_id, db)
    if error:
        raise HTTPException(status_code=404, detail=error)
    return {"job_id": job_id, "user_id": user_id, "score": score}
