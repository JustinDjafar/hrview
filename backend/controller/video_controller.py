import os
import subprocess
import shutil
from datetime import datetime
from fastapi import HTTPException   
from sqlalchemy.orm import Session
from models.users import User, InterviewStatus
from models.questions import Questions
from models.answer import Answer
from models.users import User

BASE_VIDEO_DIR = "videos"

async def save_hr_video(title: str, file, db: Session):
    upload_dir = os.path.join(BASE_VIDEO_DIR, "hr")
    os.makedirs(upload_dir, exist_ok=True)

    # 2. Ambil ekstensi file asli
    original_filename = file.filename
    ext = os.path.splitext(original_filename)[1]

    # 3. Rename file sesuai title
    safe_title = title.replace(" ", "_")
    new_filename = f"{safe_title}{ext}"
    filepath = os.path.join(upload_dir, new_filename)

    try:
        with open(filepath, "wb") as buffer:
            buffer.write(await file.read())
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Gagal menyimpan file: {str(e)}")

    # 4. Insert langsung ke database
    new_question = questions.Questions(
        question_title=title,
        url_video=filepath,
        created_at=datetime.utcnow()
    )
    db.add(new_question)
    db.commit()
    db.refresh(new_question)

    return {
        "message": "Question + video inserted",
        "id_question": new_question.id_question,
        "title": title,
        "file_path": filepath
    }

async def save_candidate_video(user_id: int, question_id: int, file, db: Session):
    user = db.query(User).filter(User.id_user == user_id).first()
    if not user:
        return None, "User not found"

    if user.interview_status == InterviewStatus.completed:
        return None, "Interview already completed"

    if user.interview_status == InterviewStatus.not_started:
        user.interview_status = InterviewStatus.in_progress
        db.commit()

    user_name = user.name.replace(" ", "_")
    user_dir = os.path.join(BASE_VIDEO_DIR, "kandidat", user_name)
    os.makedirs(user_dir, exist_ok=True)

    # Save the uploaded file with a temporary name
    temp_filename = f"{user_name}_question{question_id}_temp.webm"
    temp_filepath = os.path.join(user_dir, temp_filename)

    with open(temp_filepath, "wb") as f:
        f.write(await file.read())

    # Convert the file to MP4 using ffmpeg
    output_filename = f"{user_name}_question{question_id}.mp4"
    output_filepath = os.path.join(user_dir, output_filename)
    
    try:
        subprocess.run(['ffmpeg', '-i', temp_filepath, '-c:v', 'libx264', '-c:a', 'aac', '-strict', 'experimental', output_filepath], check=True)
    except subprocess.CalledProcessError as e:
        # Handle conversion error
        return None, f"Failed to convert video: {e}"
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_filepath):
            os.remove(temp_filepath)

    answer = Answer(
        user_id=user_id,
        question_id=question_id,
        video_url=output_filepath
    )
    db.add(answer)
    db.commit()

    return output_filepath, None


def get_hr_video(question_id: int, db: Session):
    question = db.query(questions).filter(questions.id_question == question_id).first()
    if not question or not question.url_video:
        return None, "Video not found"
    if not os.path.exists(question.url_video):
        return None, "File not found"
    return question.url_video, None


def get_candidate_video(user_id: int, question_id: int, db: Session):
    answer = db.query(answer).filter(
        answer.user_id == user_id,
        answer.question_id == question_id
    ).first()

    if not answer or not answer.video_url:
        return None, "Video not found"
    if not os.path.exists(answer.video_url):
        return None, "File not found"
    return answer.video_url, None


def list_hr_videos(db: Session):
    return db.query(Questions).all()


def list_candidate_videos(db: Session):
    return db.query(Answer).all()


def list_videos_by_user(user_id: int, db: Session):
    return db.query(Answer).filter(Answer.user_id == user_id).all()


def list_videos_by_question(question_id: int, db: Session):
    return db.query(Answer).filter(Answer.question_id == question_id).all()

def get_answers_by_user_and_list(user_id: int, list_id: int, db: Session):
    return db.query(Answer).filter(Answer.user_id == user_id, Answer.id_list_questions == list_id).all()

def list_all_candidate_answers(db: Session):
    return (
        db.query(
            Answer.id,
            Answer.video_url,
            Answer.transcript,
            User.id_user,
            User.name,
            User.email,
            Questions.id_question,
            Questions.question_title
        )
        .join(User, Answer.user_id == User.id_user)
        .join(Questions, Answer.question_id == Questions.id_question)
        .all()
    )


async def update_hr_video_title(question_id: int, new_title: str, db: Session):
    video = db.query(Questions).filter(Questions.id_question == question_id).first()
    if not video:
        return False
    
    old_filepath = video.url_video
    
    # Extract directory and extension
    directory = os.path.dirname(old_filepath)
    ext = os.path.splitext(old_filepath)[1]
    
    # Create new filename
    safe_new_title = new_title.replace(" ", "_")
    new_filename = f"{safe_new_title}{ext}"
    new_filepath = os.path.join(directory, new_filename)

    # Rename the file on the filesystem
    if os.path.exists(old_filepath):
        os.rename(old_filepath, new_filepath)
    
    video.question_title = new_title
    video.url_video = new_filepath
    db.commit()
    db.refresh(video)
    return video

async def delete_hr_video_by_id(question_id: int, db: Session):
    video = db.query(Questions).filter(Questions.id_question == question_id).first()
    if not video:
        return False
    
    # Delete the video file from the file system
    if os.path.exists(video.url_video):
        os.remove(video.url_video)

    db.delete(video)
    db.commit()
    return True

async def delete_candidate_video(answer_id: int, db: Session):
    answer = db.query(Answer).filter(Answer.id == answer_id).first()
    if not answer:
        return False

    # Delete the video file from the file system
    if os.path.exists(answer.video_url):
        os.remove(answer.video_url)

    db.delete(answer)
    db.commit()
    return True
