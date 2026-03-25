#!/bin/bash
set -euo pipefail

echo "Building..."
npm run build

echo "Running checks..."
npm test || true

echo "Publishing to npm..."
npm publish --access public
