#!/bin/bash

# Script to check for and kill idle services

echo "Checking for running services..."

# Check for backend processes
BACKEND_PIDS=$(ps aux | grep -E "python.*main.py|uvicorn" | grep -v grep | awk '{print $2}')
if [ ! -z "$BACKEND_PIDS" ]; then
    echo "Found backend processes: $BACKEND_PIDS"
    for pid in $BACKEND_PIDS; do
        echo "  Killing PID $pid..."
        kill $pid 2>/dev/null || true
    done
else
    echo "No backend processes found."
fi

# Check for frontend processes
FRONTEND_PIDS=$(ps aux | grep -E "node.*vite|vite" | grep -v grep | awk '{print $2}')
if [ ! -z "$FRONTEND_PIDS" ]; then
    echo "Found frontend processes: $FRONTEND_PIDS"
    for pid in $FRONTEND_PIDS; do
        echo "  Killing PID $pid..."
        kill $pid 2>/dev/null || true
    done
else
    echo "No frontend processes found."
fi

# Check ports
echo ""
echo "Checking ports..."
for port in 8000 5173 5174; do
    PIDS=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$PIDS" ]; then
        echo "Port $port is in use by PIDs: $PIDS"
        for pid in $PIDS; do
            echo "  Killing PID $pid on port $port..."
            kill -9 $pid 2>/dev/null || true
        done
    else
        echo "Port $port is free."
    fi
done

echo ""
echo "Cleanup complete."

