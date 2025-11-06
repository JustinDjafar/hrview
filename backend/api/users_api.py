from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from database import get_db
from models.list_questions import ListQuestions
from models.users import User, UserRole
from controller.auth_controller import get_current_user, admin_required, complete_interview
from schemas.users import AssignListRequest, UserCreate, UserResponse, UserUpdate

router = APIRouter( tags=["users"])

@router.post("/create", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    # current_user: User = Depends(admin_required)
):
    """
    Membuat user baru (hanya admin yang bisa)
    """
    # Cek apakah email sudah terdaftar
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email sudah terdaftar"
        )
    
    # Validasi role
    if user_data.role not in ["admin", "user"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role harus 'admin' atau 'user'"
        )
    
    # Validasi: Admin tidak boleh punya assigned_list_id
    if user_data.role == "admin" and user_data.assigned_list_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin tidak memerlukan list assignment"
        )
    
    # Validasi: Cek apakah list_id valid jika user biasa
    if user_data.role == "user" and user_data.assigned_list_id:
        list_exists = db.query(ListQuestions).filter(
            ListQuestions.id_list_question == user_data.assigned_list_id
        ).first()
        if not list_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="List pertanyaan tidak ditemukan"
            )
    
    # Buat user baru
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        role=UserRole.ADMIN if user_data.role == "admin" else UserRole.USER,
        assigned_list_id=user_data.assigned_list_id if user_data.role == "user" else None
    )
    new_user.setpassword(user_data.password)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Ambil title list jika ada
    list_title = None
    if new_user.assigned_list_id:
        assigned_list = db.query(ListQuestions).filter(
            ListQuestions.id_list_question == new_user.assigned_list_id
        ).first()
        if assigned_list:
            list_title = assigned_list.list_title
    
    return UserResponse(
        id_user=new_user.id_user,
        name=new_user.name,
        email=new_user.email,
        role=new_user.role.value,
        is_active=new_user.is_active,
        assigned_list_id=new_user.assigned_list_id,
        assigned_list_title=list_title,
        interview_status=new_user.interview_status.value
    )


@router.get("/all", response_model=List[UserResponse])
async def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    """
    Mendapatkan semua user (hanya admin yang bisa)
    """
    users = db.query(User).all()
    
    result = []
    for user in users:
        list_title = None
        if user.assigned_list_id:
            assigned_list = db.query(ListQuestions).filter(
                ListQuestions.id_list_question == user.assigned_list_id
            ).first()
            if assigned_list:
                list_title = assigned_list.list_title
        
        result.append(UserResponse(
            id_user=user.id_user,
            name=user.name,
            email=user.email,
            role=user.role.value,
            is_active=user.is_active,
            assigned_list_id=user.assigned_list_id,
            assigned_list_title=list_title,
            interview_status=user.interview_status.value
        ))
    
    return result


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mendapatkan info user yang sedang login
    """
    list_title = None
    if current_user.assigned_list_id:
        assigned_list = db.query(ListQuestions).filter(
            ListQuestions.id_list_question == current_user.assigned_list_id
        ).first()
        if assigned_list:
            list_title = assigned_list.list_title
    
    return UserResponse(
        id_user=current_user.id_user,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role.value,
        is_active=current_user.is_active,
        assigned_list_id=current_user.assigned_list_id,
        assigned_list_title=list_title,
        interview_status=current_user.interview_status.value
    )

@router.post("/me/complete-interview", status_code=status.HTTP_200_OK)
async def complete_current_user_interview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Menandai interview user yang sedang login sebagai selesai
    """
    return await complete_interview(current_user, db)

@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    """
    Mendapatkan detail user berdasarkan ID (hanya admin yang bisa)
    """
    user = db.query(User).filter(User.id_user == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User tidak ditemukan"
        )
    
    list_title = None
    if user.assigned_list_id:
        assigned_list = db.query(ListQuestions).filter(
            ListQuestions.id_list_question == user.assigned_list_id
        ).first()
        if assigned_list:
            list_title = assigned_list.list_title
    
    return UserResponse(
        id_user=user.id_user,
        name=user.name,
        email=user.email,
        role=user.role.value,
        is_active=user.is_active,
        assigned_list_id=user.assigned_list_id,
        assigned_list_title=list_title,
        interview_status=user.interview_status.value
    )


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    """
    Update user (hanya admin yang bisa)
    """
    user = db.query(User).filter(User.id_user == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User tidak ditemukan"
        )
    
    # Update fields yang diberikan
    if user_data.name:
        user.name = user_data.name
    
    if user_data.email:
        # Cek apakah email sudah digunakan user lain
        existing = db.query(User).filter(
            User.email == user_data.email,
            User.id_user != user_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email sudah digunakan"
            )
        user.email = user_data.email
    
    if user_data.role:
        if user_data.role not in ["admin", "user"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role harus 'admin' atau 'user'"
            )
        user.role = UserRole.ADMIN if user_data.role == "admin" else UserRole.USER
        
        # Reset assigned_list jika diubah jadi admin
        if user_data.role == "admin":
            user.assigned_list_id = None
    
    if user_data.is_active is not None:
        user.is_active = user_data.is_active
    
    # Update assigned_list_id
    if user_data.assigned_list_id is not None:
        if user.role == UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Admin tidak memerlukan list assignment"
            )
        
        # Validasi list_id jika bukan None
        if user_data.assigned_list_id > 0:
            list_exists = db.query(ListQuestions).filter(
                ListQuestions.id_list_question == user_data.assigned_list_id
            ).first()
            if not list_exists:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="List pertanyaan tidak ditemukan"
                )
            user.assigned_list_id = user_data.assigned_list_id
        else:
            user.assigned_list_id = None
    
    db.commit()
    db.refresh(user)
    
    list_title = None
    if user.assigned_list_id:
        assigned_list = db.query(ListQuestions).filter(
            ListQuestions.id_list_question == user.assigned_list_id
        ).first()
        if assigned_list:
            list_title = assigned_list.list_title
    
    return UserResponse(
        id_user=user.id_user,
        name=user.name,
        email=user.email,
        role=user.role.value,
        is_active=user.is_active,
        assigned_list_id=user.assigned_list_id,
        assigned_list_title=list_title,
        interview_status=user.interview_status.value
    )


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    """
    Hapus user (hanya admin yang bisa)
    """
    user = db.query(User).filter(User.id_user == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User tidak ditemukan"
        )
    
    # Tidak bisa hapus diri sendiri
    if user.id_user == current_user.id_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tidak dapat menghapus akun sendiri"
        )
    
    db.delete(user)
    db.commit()
    return None


@router.post("/assign-list", response_model=UserResponse)
async def assign_list_to_user(
    request: AssignListRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    """
    Assign list pertanyaan ke user (hanya admin yang bisa)
    """
    user = db.query(User).filter(User.id_user == request.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User tidak ditemukan"
        )
    
    # Validasi: Admin tidak bisa di-assign list
    if user.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin tidak memerlukan list assignment"
        )
    
    # Validasi list_id jika diberikan
    if request.list_id:
        list_exists = db.query(ListQuestions).filter(
            ListQuestions.id_list_question == request.list_id
        ).first()
        if not list_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="List pertanyaan tidak ditemukan"
            )
        user.assigned_list_id = request.list_id
    else:
        # Unassign list
        user.assigned_list_id = None
    
    db.commit()
    db.refresh(user)
    
    list_title = None
    if user.assigned_list_id:
        assigned_list = db.query(ListQuestions).filter(
            ListQuestions.id_list_question == user.assigned_list_id
        ).first()
        if assigned_list:
            list_title = assigned_list.list_title
    
    return UserResponse(
        id_user=user.id_user,
        name=user.name,
        email=user.email,
        role=user.role.value,
        is_active=user.is_active,
        assigned_list_id=user.assigned_list_id,
        assigned_list_title=list_title,
        interview_status=user.interview_status.value
    )