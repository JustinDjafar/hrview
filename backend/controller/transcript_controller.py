from sqlalchemy.orm import Session
from models.answer import Answer
from transcript import model as transcript_model
import os
import ffmpeg

async def transcribe_video(answer_id: int, db: Session):
    print(f"Entering transcribe_video for answer_id: {answer_id}")
    answer = db.query(Answer).filter(Answer.id == answer_id).first()
    print(f"Answer found: {answer}")
    if not answer:
        print(f"Answer with ID {answer_id} not found.")
        return None

    video_path = answer.video_url
    print(f"Video path: {video_path}, exists: {os.path.exists(video_path)}")
    if not os.path.exists(video_path):
        print(f"Video file not found at path: {video_path}")
        return {"error": "Video file not found."}

    audio_path = os.path.splitext(video_path)[0] + ".mp3"
    try:
        ffmpeg.input(video_path).output(audio_path, acodec='mp3').run(overwrite_output=True)
    except Exception as e:
        print(f"FFmpeg error: {str(e)}")
        return {"error": f"Failed to extract audio: {str(e)}"}

    transcript_result = await transcript_model.get_transcript_from_audio(audio_path)
    print(f"Transcript result from model: {transcript_result}")

    answer.transcript = transcript_result.get("text", "")
    db.commit()

    os.remove(audio_path)

    return {"answer_id": answer_id, "transcript": answer.transcript}
