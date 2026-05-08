# AI Resume Builder & Analyzer

A complete AI-powered Resume Builder and Resume Analyzer web platform built with React + FastAPI + MongoDB + Gemini AI.

## Features

- **Resume Builder** — Multi-step form with real-time preview, 4 templates, AI summary generation, PDF export
- **Resume Analyzer** — Upload PDF/DOCX, get AI scoring (ATS, Quality, Completeness)
- **ATS Checker** — Rule-based + AI ATS compatibility analysis
- **Job Matcher** — Semantic matching between resume and job descriptions
- **Interview Generator** — Role and skill-specific interview questions
- **AI Career Assistant** — Gemini-powered chatbot for career advice
- **Analytics Dashboard** — Score trends, charts, activity history
- **Admin Panel** — User management, platform analytics
- **JWT Authentication** — Secure signup/login with bcrypt passwords

---

## Project Structure

```
resume-analyser/
├── frontend/          # React 18 + Vite + Tailwind CSS + Framer Motion
│   └── src/
│       ├── pages/     # All page components (12 pages)
│       ├── components/# UI, layout, analysis, chat components
│       ├── services/  # API service layer (Axios)
│       ├── context/   # Auth context
│       └── utils/     # Helpers, constants
└── backend/           # FastAPI + Motor (MongoDB) + Gemini AI
    ├── routers/       # All API routes
    ├── services/      # AI, ATS, file parsing, export services
    ├── config/        # Database, settings
    ├── schemas/       # Pydantic request/response models
    └── utils/         # JWT, password, response handlers
```

---

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+ (recommended) or Python 3.14+ 
- MongoDB Atlas account (or local MongoDB)

> **Note**: Python 3.14 has SSL compatibility issues with MongoDB Atlas. Use Python 3.11 or 3.12 for best results.

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
# Edit .env with your credentials
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit: http://localhost:5173

API Docs: http://localhost:8000/docs

---

## Environment Variables

### Backend (.env)
```env
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/?appName=Cluster1
DATABASE_NAME=resume_ai
SECRET_KEY=your-super-secret-key-at-least-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123
GEMINI_API_KEY=your-gemini-api-key-here   # Get from aistudio.google.com
CORS_ORIGINS=http://localhost:5173
MAX_FILE_SIZE_MB=10
UPLOAD_DIR=uploads
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

---

## Adding Gemini AI

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Create an API key (free tier available)
3. Add to `backend/.env`: `GEMINI_API_KEY=your_key_here`
4. Restart backend — all AI features will activate automatically

---

## MongoDB Atlas Fix (Python 3.14 SSL)

If you see SSL handshake errors:

**Option 1**: Use Python 3.11 or 3.12 (recommended)

**Option 2**: Go to MongoDB Atlas:
1. `Network Access` → `Add IP Address` → `Allow Access from Anywhere (0.0.0.0/0)`
2. Ensure your Atlas cluster is M0 (free) or higher

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register user |
| POST | `/auth/login` | Login + JWT |
| GET | `/auth/me` | Current user |
| GET/POST | `/resumes/` | List / Create resume |
| GET/PUT/DELETE | `/resumes/{id}` | Resume operations |
| POST | `/analyze/upload` | Analyze PDF/DOCX |
| POST | `/analyze/text` | Analyze text resume |
| POST | `/ats/check` | ATS compatibility |
| POST | `/jobs/match` | Job description match |
| POST | `/ai/suggest` | AI suggestions |
| POST | `/ai/generate-summary` | AI summary |
| POST | `/interview/generate` | Interview questions |
| POST | `/chat/message` | AI chatbot |
| GET | `/export/pdf/{id}` | Export resume PDF |
| GET | `/admin/analytics` | Admin analytics |

---

## Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel
# Set VITE_API_URL to your backend URL
```

### Backend → Render
1. Connect GitHub repo to Render
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add all environment variables in Render dashboard

### Database → MongoDB Atlas
- Already configured! Just ensure IP whitelist includes Render's IPs

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS v3, Framer Motion |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | FastAPI, Python |
| Database | MongoDB Atlas (Motor async driver) |
| AI | Google Gemini 1.5 Flash |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| PDF Parse | pdfplumber, PyPDF2 |
| DOCX Parse | python-docx |
| PDF Export | ReportLab |

---

## Admin Access

Default admin credentials (seeded automatically):
- Email: `Harthikspoonja@gmail.com`
- Password: `Harthik@1408`
- Access: `/dashboard/admin`

---

Built with by the AI Resume Builder Team | Powered by Google Gemini AI
