# Wellnix - AI-Powered Health & Fitness Platform

<div align="center">

**Scan nutrition labels, analyze workout form, and chat with Ana for personalized diet plans.**

[![Python](https://img.shields.io/badge/Python-3.11+-blue)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![Flask](https://img.shields.io/badge/Flask-3.0-green)](https://flask.palletsprojects.com)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8)](https://tailwindcss.com)

</div>

---

## Overview

Wellnix is a full-stack health platform with three AI-powered products:

- **Nutri AI** - Photograph any nutrition label and get an instant health score, nutrient breakdown, and personalized dietary recommendations using OCR + AI scoring.
- **Muscle AI** - Upload a workout video and receive real-time form analysis, rep counting, and injury prevention feedback powered by YOLOv8 pose estimation.
- **Ana** - A RAG-based nutrition chatbot. Tell Ana what ingredients you have, and she suggests healthy, balanced meals personalized to your profile and medical needs.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, Tailwind CSS 4, TypeScript |
| Backend API | Flask, SQLAlchemy, PyJWT, Flask-Login |
| AI / ML | YOLOv8, EasyOCR, Groq (Llama 3), RAG retrieval |
| Async Tasks | Celery + Redis |
| Database | SQLite (dev), PostgreSQL-ready |
| Deployment | Vercel (frontend), any WSGI server (backend) |

---

## Project Structure

```
wellnix/
├── frontend/                # Next.js frontend (port 3000)
│   ├── src/app/             # 20 page routes
│   ├── src/components/      # Reusable UI components
│   ├── src/lib/             # API client, auth context, types
│   └── src/hooks/           # Custom React hooks
│
├── gateway/                 # Flask API Gateway (port 5000)
│   ├── app.py               # Main app with JSON API + legacy routes
│   ├── auth_jwt.py          # JWT authentication
│   ├── celery_app.py        # Async task config
│   └── tasks.py             # Celery tasks
│
├── services/
│   ├── nutri_ai_service/    # Nutrition scanning (port 5001)
│   │   └── core/ana/        # Ana RAG chatbot agent
│   ├── muscle_ai_service/   # Workout analysis (port 5002)
│   └── shared/database/     # SQLAlchemy models
│
├── data/
│   ├── nutri-ai/            # RAG knowledge base (book_chunks, diseases, nutrient_limits)
│   └── ml-models/yolo/      # YOLO model weights (not in repo, see setup)
│
└── web/                     # Legacy Jinja2 templates (kept for compatibility)
```

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- (Optional) Redis for async Muscle AI processing

### 1. Clone and set up

```bash
git clone https://github.com/thedixitjain/Wellnix.git
cd Wellnix
```

### 2. Backend setup

```bash
python -m venv .venv

# Windows
.\.venv\Scripts\Activate.ps1
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt

cp env.example .env
# Edit .env and add your GROQ_API_KEY (free at https://console.groq.com)
```

### 3. Frontend setup

```bash
cd frontend
npm install
cd ..
```

### 4. Download YOLO models (for Muscle AI)

Place the YOLO `.pt` model files in `data/ml-models/yolo/`. These are not included in the repo due to size. Contact the maintainers or train your own models.

### 5. Run

Open two terminals:

```bash
# Terminal 1: Backend (port 5000)
python gateway/app.py

# Terminal 2: Frontend (port 3000)
cd frontend && npm run dev
```

Open **http://localhost:3000** in your browser.

---

## API Endpoints

All API routes are prefixed with `/api/v1/`:

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | - | Create account |
| POST | `/auth/login` | - | Get JWT tokens |
| POST | `/auth/refresh` | - | Refresh access token |
| GET | `/user` | JWT | Get user profile |
| PUT | `/user/settings` | JWT | Update profile |
| GET | `/user/scans` | JWT | Scan history (paginated) |
| GET | `/user/workouts` | JWT | Workout history (paginated) |
| GET | `/dashboard/stats` | JWT | Dashboard statistics |
| POST | `/nutri-ai/upload` | Optional | Upload nutrition label |
| POST | `/nutri-ai/analyze` | Optional | Analyze nutrition data |
| POST | `/muscle-ai/upload` | Optional | Upload workout video |
| GET | `/muscle-ai/task/:id` | - | Poll async task status |
| POST | `/ana/chat` | Optional | Chat with Ana |

---

## Environment Variables

See `env.example` for all configuration options. The only required variable for basic functionality is:

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | For Ana chatbot | Free API key from [console.groq.com](https://console.groq.com) |
| `SECRET_KEY` | Yes | Flask session secret |
| `JWT_SECRET_KEY` | Yes | JWT signing secret |

---

## Deployment

### Frontend (Vercel)

The Next.js frontend deploys to Vercel. Set the root directory to `frontend/` in your Vercel project settings. Configure the `NEXT_PUBLIC_API_URL` environment variable to point to your deployed backend.

### Backend

Deploy the Flask backend to any WSGI-compatible host (Railway, Render, AWS, etc.). Ensure all environment variables from `.env` are configured.

---

## Acknowledgments

- Harvard Medical School nutrition research (RAG knowledge base)
- Ultralytics YOLOv8 for pose estimation
- Groq for fast LLM inference
- EasyOCR for text extraction

---

## License

This project is licensed under the MIT License.
