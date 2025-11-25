#!/bin/bash
# Deprecated: This script is kept for backward compatibility
# Use ./setup.sh instead

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Note: setup_ec2.sh is deprecated. Using setup.sh instead..."
exec "$SCRIPT_DIR/setup.sh"

