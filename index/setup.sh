#!/bin/bash
set -e

echo "Setting up Croissant Task Index..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

# Install system dependencies
echo "Installing system dependencies..."
if command -v apt-get &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y python3 python3-pip curl
    
    # Install Node.js 20 LTS if not already installed
    if ! command -v node &> /dev/null || [ "$(node --version | cut -d'v' -f2 | cut -d'.' -f1)" -lt 18 ]; then
        echo "Installing Node.js 20 LTS..."
        sudo apt-get remove -y nodejs npm libnode-dev libnode72 2>/dev/null || true
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    echo "Node.js version: $(node --version)"
    echo "npm version: $(npm --version)"
fi

# Install Python dependencies
echo "Installing Python dependencies..."
pip3 install -r requirements.txt

# Generate task data from CSV
echo "Generating task data from CSV..."
python3 scripts/generate_data.py

# Install Node.js dependencies and build frontend
echo "Building frontend..."
cd index/frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi
npm run build
cd ../..

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Start the app: cd index && ./start.sh"
echo "  2. (Optional) Setup nginx: sudo ./setup-nginx.sh"
echo ""

