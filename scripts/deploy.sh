#!/bin/bash
set -euo pipefail

echo "Building..."
npm run build

echo "Deploying to Railway..."
if command -v railway &> /dev/null; then
  railway up
else
  echo "Railway CLI not found. Install with: npm i -g @railway/cli"
  echo "Or deploy manually: push to GitHub and connect via railway.app"
  exit 1
fi
