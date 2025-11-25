#!/bin/bash
set -e

echo "Setting up Croissant Tasks Index on EC2..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

# Install system dependencies
echo "Installing system dependencies..."
sudo apt-get update
sudo apt-get install -y python3 python3-pip curl

# Install Node.js 20 LTS (required for frontend build)
echo "Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js version
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Install Python dependencies
echo "Installing Python dependencies..."
pip3 install -r requirements.txt

# Generate task data from CSV
echo "Generating task data from CSV..."
python3 scripts/generate_data.py

# Install Node.js dependencies and build frontend
echo "Building frontend..."
cd index/frontend
npm install
npm run build
cd ../..

echo "Setup complete!"
echo ""
echo "To start the server, run:"
echo "  cd index/backend"
echo "  python3 -m uvicorn main:app --host 0.0.0.0 --port 8000"
echo ""
echo "Or use a process manager like systemd or supervisor for production."

