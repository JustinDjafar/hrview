from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey
from database import Base
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import enum
from sqlalchemy import Enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"

class InterviewStatus(str, enum.Enum):
    not_started = "not_started"
    in_progress = "in_progress"
    completed = "completed"

class User(Base):
    __tablename__ = "users"
    id_user = Column(Integer, primary_key=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    answers = relationship("Answer", back_populates="user")
    assigned_list = relationship("ListQuestions", back_populates="assigned_users")
    assigned_list_id = Column(Integer, ForeignKey("list_questions.id_list_question"), nullable=True)
    interview_status = Column(Enum(InterviewStatus, native_enum=False), default=InterviewStatus.not_started, nullable=False)


    def __repr__(self):
        return f'<User {self.name} - {self.role}>'

    def setpassword(self, password):
        self.password = generate_password_hash(password)
    
    def checkpassword(self, password):
        return check_password_hash(self.password, password)
    
    def is_admin(self):
        return self.role == UserRole.ADMIN
    
