#!/bin/bash

# Build script for Netlify deployment
echo "Starting build process for Netlify deployment..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the React application
echo "Building React application..."
npm run build

echo "Build completed successfully!"
echo "Build directory contents:"
ls -la build/

echo "Ready for Netlify deployment!"