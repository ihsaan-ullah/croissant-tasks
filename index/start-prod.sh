#!/bin/bash
set -e

echo "Starting Croissant Task Index (Production Mode)..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

# Check if frontend is built
FRONTEND_DIST="$SCRIPT_DIR/frontend/dist"
if [ ! -d "$FRONTEND_DIST" ] || [ -z "$(ls -A $FRONTEND_DIST 2>/dev/null)" ]; then
    echo "Frontend not built. Building now..."
    cd "$SCRIPT_DIR/frontend"
    if [ ! -d "node_modules" ]; then
        echo "Installing frontend dependencies..."
        npm install
    fi
    npm run build
    cd "$SCRIPT_DIR"
    echo "Frontend built successfully."
else
    echo "Frontend already built."
fi

# Check if task data exists
TASKS_DIR="$ROOT_DIR/data/tasks"
if [ ! -d "$TASKS_DIR" ] || [ -z "$(ls -A $TASKS_DIR/*.json 2>/dev/null)" ]; then
    echo "Task data not found. Generating from CSV..."
    python3 "$ROOT_DIR/scripts/generate_data.py"
    echo "Task data generated successfully."
else
    echo "Task data already exists."
fi

# Check if Python dependencies are installed
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "Installing Python dependencies..."
    pip3 install -r "$ROOT_DIR/requirements.txt"
fi

# Start backend server (serves built frontend)
echo ""
echo "Starting backend server..."
echo "Server will be accessible at: http://0.0.0.0:8000"
echo "Press Ctrl+C to stop"
echo ""

cd "$SCRIPT_DIR/backend"
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000

