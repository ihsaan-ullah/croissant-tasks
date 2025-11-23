bash# Croissant Task Index Web UI

## Quick Start
Run the unified launch script:
```bash
./start.sh
```
This will:
1. Generate tasks if needed.
2. Start the Backend (FastAPI).
3. Start the Frontend (React).
4. Show you the URL (http://localhost:5173).

**Graceful Shutdown**: Press `Ctrl+C` to stop all services cleanly.

## Stopping Services

### Check for Idle Services
```bash
# Check what's running
ps aux | grep -E "(python.*main.py|node.*vite)" | grep -v grep
lsof -i :8000 -i :5173 -i :5174
```

### Stop All Services
```bash
./stop.sh
```
This script will kill all backend/frontend processes and free up ports 8000, 5173, and 5174.

## Prerequisites
- Python 3.8+
- Node.js 18+

## Manual Setup (Alternatives)

### 1. Generate Tasks
```bash
cd ../croissant-of-croissants
python3 generate_task_croissants.py
```

### 2. Backend
```bash
cd backend
pip install -r requirements.txt
python3 main.py
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
