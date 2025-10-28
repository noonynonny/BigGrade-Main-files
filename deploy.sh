#!/bin/bash

# Deployment script for Firebase Hosting
echo "Starting deployment to Firebase Hosting..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null
then
    echo "Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if we're logged in to Firebase
if ! firebase projects:list &> /dev/null
then
    echo "Not logged in to Firebase. Please log in:"
    firebase login
fi

# Build the React application
echo "Building React application..."
npm run build

# Deploy to Firebase Hosting
echo "Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo "Deployment completed!"