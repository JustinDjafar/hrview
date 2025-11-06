from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "user"
    assigned_list_id: Optional[int] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    assigned_list_id: Optional[int] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id_user: int
    name: str
    email: str
    role: str
    is_active: bool
    assigned_list_id: Optional[int]
    assigned_list_title: Optional[str] = None
    interview_status: Optional[str] = None
    
    class Config:
        from_attributes = True

class AssignListRequest(BaseModel):
    user_id: int
    list_id: Optional[int] = None