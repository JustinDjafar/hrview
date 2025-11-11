# HRView Project

## Project Overview

This project is a web application called HRView. It consists of a React frontend and a FastAPI backend. The application appears to be a tool for human resources, possibly for video interviews and candidate management, given the file names and dependencies.

### Frontend

*   **Framework:** React with Vite
*   **Styling:** Tailwind CSS
*   **Key Libraries:**
    *   `axios` for HTTP requests
    *   `react-router-dom` for routing
    *   `livekit-client` and `@livekit/components-react` for real-time video

### Backend

*   **Framework:** FastAPI
*   **Database:** PostgreSQL (inferred from `psycopg2-binary`)
*   **ORM:** SQLAlchemy
*   **Key Libraries:**
    *   `alembic` for database migrations
    *   `scikit-learn` and `sentence-transformers` for machine learning tasks

## Building and Running

### Frontend

To run the frontend development server:

```bash
cd frontend
npm install
npm run dev
```

To build the frontend for production:

```bash
cd frontend
npm run build
```

### Backend

To run the backend server:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**Note:** You may need to set up a PostgreSQL database and configure the connection in the backend.

## Development Conventions

*   The frontend code is located in the `frontend/src` directory.
*   The backend code is organized into `api`, `controller`, `models`, and `schemas` directories.
*   Database migrations are managed with Alembic and are located in the `backend/alembic/versions` directory.
