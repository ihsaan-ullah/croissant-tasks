#!/bin/bash
set -e

# Smart start script that detects environment and starts appropriately

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Parse arguments
MODE="${1:-prod}"  # Default to production mode
USE_NGINX=false

# Check if nginx is configured
if [ -L /etc/nginx/sites-enabled/croissant-tasks ]; then
    USE_NGINX=true
fi

# Development mode
if [ "$MODE" = "dev" ]; then
    echo "Starting in DEVELOPMENT mode..."
    echo ""
    
    # Check/Generate Tasks
    TASKS_DIR="$ROOT_DIR/data/tasks"
    if [ ! -d "$TASKS_DIR" ] || [ -z "$(ls -A $TASKS_DIR/*.json 2>/dev/null)" ]; then
        echo "Generating tasks..."
        (cd "$ROOT_DIR" && python3 scripts/generate_data.py)
    fi
    
    # PIDs to track
    BACKEND_PID=""
    FRONTEND_PID=""
    
    # Cleanup function
    cleanup() {
        echo ""
        echo "Stopping services..."
        if [ ! -z "$FRONTEND_PID" ]; then
            kill $FRONTEND_PID 2>/dev/null || true
        fi
        if [ ! -z "$BACKEND_PID" ]; then
            kill $BACKEND_PID 2>/dev/null || true
        fi
        lsof -ti:8000 | xargs kill -9 2>/dev/null || true
        lsof -ti:5173 | xargs kill -9 2>/dev/null || true
        echo "Done."
        exit 0
    }
    
    trap cleanup SIGINT SIGTERM EXIT
    
    # Start Backend
    echo "Starting Backend (FastAPI) on http://localhost:8000..."
    cd "$SCRIPT_DIR/backend"
    python3 -m uvicorn main:app --reload > /dev/null 2>&1 &
    BACKEND_PID=$!
    cd "$SCRIPT_DIR"
    sleep 2
    
    # Start Frontend
    echo "Starting Frontend (Vite) on http://localhost:5173..."
    cd "$SCRIPT_DIR/frontend"
    if [ ! -d "node_modules" ]; then
        npm install > /dev/null 2>&1
    fi
    npm run dev -- --host &
    FRONTEND_PID=$!
    cd "$SCRIPT_DIR"
    
    echo ""
    echo "Application is ready!"
    echo "  Frontend: http://localhost:5173"
    echo "  Backend API: http://localhost:8000"
    echo "  (Ctrl+C to stop)"
    echo ""
    
    wait $FRONTEND_PID 2>/dev/null || wait $BACKEND_PID 2>/dev/null || true
    exit 0
fi

# Production mode
echo "Starting in PRODUCTION mode..."

cd "$ROOT_DIR"

# Check if frontend is built
FRONTEND_DIST="$SCRIPT_DIR/frontend/dist"
if [ ! -d "$FRONTEND_DIST" ] || [ -z "$(ls -A $FRONTEND_DIST 2>/dev/null)" ]; then
    echo "Frontend not built. Building now..."
    cd "$SCRIPT_DIR/frontend"
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    npm run build
    cd "$SCRIPT_DIR"
fi

# Check if task data exists
TASKS_DIR="$ROOT_DIR/data/tasks"
if [ ! -d "$TASKS_DIR" ] || [ -z "$(ls -A $TASKS_DIR/*.json 2>/dev/null)" ]; then
    echo "Task data not found. Generating from CSV..."
    python3 "$ROOT_DIR/scripts/generate_data.py"
fi

# Check if Python dependencies are installed
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "Installing Python dependencies..."
    pip3 install -r "$ROOT_DIR/requirements.txt"
fi

# Stop any existing backend
if lsof -ti:8000 > /dev/null 2>&1; then
    echo "Stopping existing backend..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# Determine host and port based on nginx configuration
if [ "$USE_NGINX" = true ]; then
    HOST="127.0.0.1"
    PORT="8000"
    ACCESS_URL="http://<your-server-ip>/"
    echo ""
    echo "Nginx detected - backend will run on $HOST:$PORT"
    echo "App accessible at: $ACCESS_URL"
else
    HOST="0.0.0.0"
    PORT="8000"
    ACCESS_URL="http://<your-server-ip>:8000"
    echo ""
    echo "No nginx detected - backend will run on $HOST:$PORT"
    echo "App accessible at: $ACCESS_URL"
fi

echo "Press Ctrl+C to stop"
echo ""

cd "$SCRIPT_DIR/backend"
python3 -m uvicorn main:app --host "$HOST" --port "$PORT"
