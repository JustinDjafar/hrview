# HRView Project

This document provides a comprehensive overview of the HRView project, including its architecture, technologies, and instructions for development and deployment.

## Project Overview

HRView is a web-based video interviewing platform designed to streamline the recruitment process. It allows HR managers to create video interview questions, invite candidates, and review their recorded responses. The platform consists of a React-based frontend and a Python FastAPI backend.

### Key Features

*   **Video Interviewing:** Candidates can record video responses to pre-defined questions.
*   **Question Management:** HR managers can create, edit, and organize interview questions.
*   **Candidate Management:** HR managers can invite candidates and track their progress.
*   **Video Playback and Review:** HR managers can watch and evaluate candidate responses.
*   **Real-time Communication:** The platform utilizes LiveKit for real-time video communication.

## Architecture

The project follows a client-server architecture:

*   **Frontend:** A single-page application (SPA) built with React and Vite.
*   **Backend:** A RESTful API built with Python and FastAPI.

### Technologies

#### Frontend

*   **React:** A JavaScript library for building user interfaces.
*   **Vite:** A fast build tool for modern web development.
*   **React Router:** For client-side routing.
*   **Axios:** For making HTTP requests to the backend API.
*   **LiveKit:** For real-time video and audio.
*   **Tailwind CSS:** For UI styling.

#### Backend

*   **FastAPI:** A modern, fast (high-performance) web framework for building APIs with Python.
*   **SQLAlchemy:** A SQL toolkit and Object-Relational Mapper (ORM) for Python.
*   **Alembic:** A database migration tool for SQLAlchemy.
*   **Pydantic:** For data validation and settings management.

## Getting Started

### Prerequisites

*   Node.js and npm (for the frontend)
*   Python and pip (for the backend)

### Installation and Running

#### Frontend

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173`.

#### Backend

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Create a virtual environment and activate it.
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
    *(Note: A `requirements.txt` file needs to be generated from the project's dependencies.)*
4.  Set up the database and run migrations:
    ```bash
    alembic upgrade head
    ```
5.  Run the backend server:
    ```bash
    uvicorn main:app --reload
    ```
    The backend API will be available at `http://localhost:8000`.

## Development Conventions

*   **Code Style:** Follow standard React and Python coding conventions.
*   **API Design:** The backend API should follow RESTful principles.
*   **Database Migrations:** Use Alembic to manage database schema changes.
*   **Dependencies:** Frontend dependencies are managed with npm, and backend dependencies should be managed with a `requirements.txt` file.
