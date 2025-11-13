# HRView

This is the README file for the HRView project.


backend:
- pip install -r requirements.txt
- python database.py
- alembic upgrade head
- uvicorn main:app --reload

frontend:
- npm install --legacy-peer-deps
- npm run dev