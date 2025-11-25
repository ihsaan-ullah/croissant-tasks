# Scripts Overview

This directory contains scripts for setting up and running the Croissant Task Index.

## Scripts

### Setup Scripts (Run Once)

- **`setup.sh`** - Main setup script
  - Installs system dependencies (Python, Node.js 20)
  - Installs Python and Node.js dependencies
  - Generates task data from CSV
  - Builds the frontend
  
- **`setup-nginx.sh`** - Optional nginx setup (requires sudo)
  - Installs and configures nginx
  - Sets up reverse proxy
  - Configures rate limiting and security headers

### Runtime Scripts

- **`start.sh`** - Smart start script
  - `./start.sh` - Production mode (detects nginx automatically)
  - `./start.sh dev` - Development mode (hot reload)
  
- **`stop.sh`** - Stop all running services
  - Kills backend and frontend processes
  - Cleans up ports

## Quick Start

```bash
# 1. One-time setup
cd index
./setup.sh

# 2. (Optional) Setup nginx for production
sudo ./setup-nginx.sh

# 3. Start the application
./start.sh          # Production
./start.sh dev      # Development

# 4. Stop the application
./stop.sh
```

## Deprecated Scripts

The following scripts are deprecated and replaced by `start.sh`:
- `setup_ec2.sh` → Use `setup.sh` instead
- `start-prod.sh` → Use `start.sh` instead
- `start-with-nginx.sh` → Use `start.sh` (auto-detects nginx)

