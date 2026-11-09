# ========================================================
# StaffPulse Multi-Stage Production Dockerfile
# Builds React Frontend + Python FastAPI into 1 container
# ========================================================

# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Python FastAPI Production Runner
FROM python:3.11-slim
WORKDIR /app

# Install Python backend dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy compiled frontend dist from Stage 1 into the location main.py serves
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Expose port (Render injects $PORT dynamically)
ENV PORT=10000
EXPOSE 10000

# Start Uvicorn ASGI server
CMD ["sh", "-c", "cd backend && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}"]

