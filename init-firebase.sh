#!/bin/bash

# Script to initialize Firebase project
echo "Initializing Firebase project..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null
then
    echo "Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Login to Firebase (if not already logged in)
echo "Checking Firebase login status..."
if ! firebase projects:list &> /dev/null
then
    echo "Not logged in to Firebase. Please log in:"
    firebase login
fi

# Initialize Firebase project
echo "Initializing Firebase project..."
firebase init

echo "Firebase project initialization completed!"
echo "Please review the configuration and deploy when ready."