from pydantic import BaseModel, validator
import datetime
import json

class JobBase(BaseModel):
    title: str
    description: str | None = None
    requirements: list[str]
    image_url: str | None = None

    @validator('requirements', pre=True)
    def parse_requirements(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v

class JobCreate(JobBase):
    pass

class Job(JobBase):
    id: int
    created_at: datetime.datetime

    class Config:
        orm_mode = True