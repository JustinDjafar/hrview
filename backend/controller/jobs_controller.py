from sqlalchemy.orm import Session
import json
import os
from models.jobs import Job
from schemas.jobs import JobCreate

def get_jobs(db: Session):
    return db.query(Job).all()

def create_job(db: Session, job: JobCreate):
    db_job = Job(
        title=job.title,
        description=job.description,
        requirements=json.dumps(job.requirements),
        image_url=job.image_url
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

def update_job(db: Session, job_id: int, job: JobCreate):
    db_job = db.query(Job).filter(Job.id == job_id).first()
    if db_job:
        # If the image is updated, delete the old one
        if db_job.image_url and db_job.image_url != job.image_url:
            old_image_path = db_job.image_url.lstrip("/")
            if os.path.exists(old_image_path):
                os.remove(old_image_path)

        db_job.title = job.title
        db_job.description = job.description
        db_job.requirements = json.dumps(job.requirements)
        db_job.image_url = job.image_url
        db.commit()
        db.refresh(db_job)
    return db_job

def delete_job(db: Session, job_id: int):
    db_job = db.query(Job).filter(Job.id == job_id).first()
    if db_job:
        # Delete associated image file if it exists
        if db_job.image_url:
            # Construct the correct path to the image file
            image_path = db_job.image_url.lstrip("/")
            if os.path.exists(image_path):
                os.remove(image_path)
        db.delete(db_job)
        db.commit()
    return db_job
