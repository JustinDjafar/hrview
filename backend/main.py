from fastapi import FastAPI
from config import settings
from fastapi.middleware.cors import CORSMiddleware
from api.list_api import router as list_router
from api.question_api import router as question_router
from api.video_api import router as video_router
from api.users_api import router as user_router
from api.auth_api import router as auth_router
from api.transcript_api import router as transcript_router
from api.jobs_api import router as jobs_router
from api.matching_api import router as matching_router # Added this import
from fastapi.staticfiles import StaticFiles


app = FastAPI(title=settings.app_name, debug=settings.debug)
app.mount("/videos", StaticFiles(directory="videos"), name="videos")
app.mount("/static", StaticFiles(directory="static"), name="static")
# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(list_router, prefix="/list")
app.include_router(question_router, prefix="/questions")
app.include_router(video_router, prefix="/video")
app.include_router(user_router, prefix="/users")
app.include_router(auth_router, prefix="/auth")
app.include_router(transcript_router, prefix="/transcript")
app.include_router(jobs_router, prefix="/jobs")
app.include_router(matching_router, prefix="/matching") # Added this line
# Logging config

