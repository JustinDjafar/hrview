from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import json
import os
import uuid

from database import get_db
from controller import jobs_controller
from schemas.jobs import Job, JobCreate
from controller.auth_controller import admin_required
from models.users import User

router = APIRouter(tags=["jobs"])

@router.get("/", response_model=List[Job])
def read_jobs(db: Session = Depends(get_db)):
    return jobs_controller.get_jobs(db)

from fastapi import Form

@router.post("/", response_model=Job, dependencies=[Depends(admin_required)])
async def create_job(
    db: Session = Depends(get_db),
    title: str = Form(...),
    description: str = Form(...),
    requirements: str = Form(...),
    file: UploadFile = File(...)
):
    # Sanitize the title to create a filename
    sanitized_title = "".join(c for c in title if c.isalnum() or c in [' ']).strip().replace(" ", "_")
    file_extension = os.path.splitext(file.filename)[1]
    image_filename = f"{sanitized_title}{file_extension}"
    image_path = os.path.join("static/job_images", image_filename)

    # Save the uploaded file
    with open(image_path, "wb") as buffer:
        buffer.write(await file.read())

    # Create a JobCreate schema object
    job_data = JobCreate(
        title=title,
        description=description,
        requirements=json.loads(requirements),
        image_url=f"/static/job_images/{image_filename}"
    )

    return jobs_controller.create_job(db=db, job=job_data)

@router.put("/{job_id}", response_model=Job, dependencies=[Depends(admin_required)])
def update_job(job_id: int, job: JobCreate, db: Session = Depends(get_db)):
    db_job = jobs_controller.update_job(db, job_id, job)
    if db_job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return db_job

@router.delete("/{job_id}", response_model=Job, dependencies=[Depends(admin_required)])
def delete_job(job_id: int, db: Session = Depends(get_db)):
    db_job = jobs_controller.delete_job(db, job_id)
    if db_job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return db_job


