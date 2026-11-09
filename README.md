# StaffPulse — Household & Estate Task Delegation Engine

A modern, responsive full-stack web application designed for luxury household and estate delegation. A Property Owner creates and assigns specific duties to designated domestic staff (e.g., Maid, Cook, Driver, Gardener), and workers receive, open, execute with live timers, and submit tasks through a single-thumb mobile interface.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React icons, Web Audio API native chime synthesizers.
- **Backend**: Python 3.10+ / 3.15+, FastAPI, Uvicorn ASGI, Pydantic v2 schemas, SQLAlchemy 2.0 ORM.
- **Database**: PostgreSQL (with automated graceful fallback to SQLite if PostgreSQL is offline).
- **Client Storage**: Browser `localStorage` for offline persistence + "Reset Demo Data" capability.

---

## ⚡ Quick Start

### 1. Launch the FastAPI Backend
```bash
# Option A: Double click run_backend.bat OR run in terminal:
cd backend
venv\Scripts\activate
python run.py
```
Backend runs at: `http://127.0.0.1:8000` (API Docs at `http://127.0.0.1:8000/docs`)

### 2. Launch the React Frontend
```bash
# Option A: Double click run_frontend.bat OR run in terminal:
cd frontend
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## 👤 Core Personas & Personas Switcher
1. **Owner / Master Admin**: Full estate control, live stats, 4-column Kanban board, inspect work, Approve & Close or Request Redo with feedback.
2. **Maya (Housekeeping / Maid)**: Mobile-optimized worker view.
3. **Anita (Chef / Cook)**: Mobile-optimized worker view.
4. **Rahul (Driver / Errands)**: Mobile-optimized worker view.
5. **Suresh (Gardener / Maintenance)**: Mobile-optimized worker view.
6. **Custom Staff**: Add new staff with custom role, phone, and avatar color theme anytime via `+ Add Staff`.

---

## 🔄 5-Stage Verifiable Duty Lifecycle
1. **ASSIGNED**: Owner creates task with room/area, urgency, due time, and bullet checklist.
2. **ACKNOWLEDGED**: Worker views task modal in their inbox; status updates to "Acknowledged" with audio feedback.
3. **IN PROGRESS**: Worker taps "Start Task"; real-time elapsed timer ticks every second.
4. **SUBMITTED / COMPLETED**: Worker checks off items, adds completion notes/remarks, and taps "Submit Work Done".
5. **OWNER VERIFICATION**: Owner inspects submitted remarks & checklist, then clicks "Approve & Close" (or "Request Redo" with feedback).

