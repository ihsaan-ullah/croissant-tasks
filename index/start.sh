#!/bin/bash

# Exit on error
set -e

# PIDs to track
BACKEND_PID=""
FRONTEND_PID=""

# Cleanup function to kill background processes on exit
cleanup() {
    echo ""
    echo "Stopping services..."
    
    # Kill frontend (Vite dev server)
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "  Stopping frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null || true
        wait $FRONTEND_PID 2>/dev/null || true
    fi
    
    # Kill backend (FastAPI)
    if [ ! -z "$BACKEND_PID" ]; then
        echo "  Stopping backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
        wait $BACKEND_PID 2>/dev/null || true
    fi
    
    # Also check for any processes on our ports and kill them
    echo "  Cleaning up ports..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    lsof -ti:5174 | xargs kill -9 2>/dev/null || true
    
    echo "Done."
    exit 0
}

# Set trap for cleanup on various signals
trap cleanup SIGINT SIGTERM EXIT

echo "Launching Croissant Task Index..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# 1. Check/Generate Tasks
TASKS_DIR="$ROOT_DIR/data/tasks"
if [ ! -d "$TASKS_DIR" ] || [ -z "$(ls -A $TASKS_DIR/*.json 2>/dev/null)" ]; then
    echo "Generating tasks..."
    (cd "$ROOT_DIR" && python3 scripts/generate_data.py)
else
    echo "Tasks found."
fi

# 2. Start Backend
echo "Starting Backend (FastAPI)..."
cd backend
# Install dependencies quietly
pip install -r "$ROOT_DIR/requirements.txt" > /dev/null 2>&1 || true
# Run backend in background
python3 -m uvicorn main:app --reload > /dev/null 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to initialize
sleep 2

# Verify backend started
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "Error: Backend failed to start"
    exit 1
fi

# 3. Start Frontend
echo "Starting Frontend (Vite)..."
cd frontend
# Install dependencies quietly
npm install > /dev/null 2>&1 || true

echo "Application is ready!"
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:8000"
echo "(Ctrl+C to stop)"

# Run frontend in background with --host to expose on network
npm run dev -- --host &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 2

# Wait for either process to exit (or user interrupt)
wait $FRONTEND_PID 2>/dev/null || wait $BACKEND_PID 2>/dev/null || true
