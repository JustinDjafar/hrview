from pydantic_settings import BaseSettings
from pydantic import Field
from dotenv import load_dotenv

# Load .env secara manual
load_dotenv()

class Settings(BaseSettings):
    # App
    app_name: str = Field("Video Interview API", env="APP_NAME")
    app_env: str = Field("development", env="APP_ENV")
    app_host: str = Field("localhost", env="APP_HOST")
    app_port: int = Field(8000, env="APP_PORT")
    debug: bool = Field(True, env="DEBUG")

    # Database
    database_url: str = Field(env="DATABASE_URL")

    # Upload
    upload_folder: str = Field("uploads/videos", env="UPLOAD_FOLDER")
    static_url: str = Field("http://localhost:8000/uploads/videos", env="STATIC_URL")

    # CORS
    allowed_origins: str = Field("http://localhost:5173", env="ALLOWED_ORIGINS")

    # Security (optional)
    secret_key: str = Field("supersecret", env="SECRET_KEY")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Inisialisasi config
settings = Settings()
