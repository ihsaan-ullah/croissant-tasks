#!/bin/bash
set -e

echo "Setting up Nginx reverse proxy for Croissant Task Index..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Install nginx if not already installed
if ! command -v nginx &> /dev/null; then
    echo "Installing nginx..."
    apt-get update
    apt-get install -y nginx
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Ask for domain name (optional)
read -p "Enter your domain name (or press Enter to use IP address/catch-all): " DOMAIN_NAME

# Copy nginx config
echo "Configuring nginx..."
cp "$SCRIPT_DIR/nginx.conf" /etc/nginx/sites-available/croissant-tasks

# Replace server_name if domain provided
if [ ! -z "$DOMAIN_NAME" ]; then
    echo "Setting server_name to: $DOMAIN_NAME"
    sed -i "s/server_name _;/server_name $DOMAIN_NAME;/" /etc/nginx/sites-available/croissant-tasks
fi

# Create symlink if it doesn't exist
if [ ! -L /etc/nginx/sites-enabled/croissant-tasks ]; then
    ln -s /etc/nginx/sites-available/croissant-tasks /etc/nginx/sites-enabled/croissant-tasks
fi

# Remove default nginx site if it exists
if [ -L /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
fi

# Test nginx configuration
echo "Testing nginx configuration..."
nginx -t

# Reload nginx
echo "Reloading nginx..."
systemctl reload nginx

echo ""
echo "Nginx setup complete!"
echo ""
echo "The app is now accessible at:"
echo "  http://<your-server-ip>/"
echo ""
echo "To enable HTTPS:"
echo "  1. Install certbot: sudo apt-get install certbot python3-certbot-nginx"
echo "  2. Get certificate: sudo certbot --nginx -d your-domain.com"
echo "  3. Uncomment HTTPS section in /etc/nginx/sites-available/croissant-tasks"
echo "  4. Reload nginx: sudo systemctl reload nginx"

