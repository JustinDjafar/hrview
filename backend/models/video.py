# from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey
# from database import Base

# class VideoRec(Base):
#     __tablename__ = "video_rec"

#     id_video = Column(Integer, primary_key=True, index=True, nullable=False)
#     id_user = Column(Integer, ForeignKey("users.id_user"), nullable=False)  # ganti "users.id" sesuai tabel user kamu
#     title = Column(String(255), nullable=True)
#     url_video = Column(String(512), nullable=False)
#     keterangan = Column(Text, nullable=True)
#     auto_remove = Column(Boolean, default=False)
#     created_at = Column(String(50), nullable=True)