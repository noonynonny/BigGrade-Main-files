#!/bin/bash

# Test script for Firebase integration
echo "Running Firebase integration tests..."

# Check if Firebase configuration exists
if [ ! -f ".env" ]; then
    echo "Warning: .env file not found. Please create it with your Firebase configuration."
fi

# Run Firebase integration tests
echo "Running Firebase tests..."
node -e "
const { runFirebaseTests } = require('./src/testFirebaseIntegration');
runFirebaseTests().then(success => {
  if (success) {
    console.log('Firebase integration tests passed!');
    process.exit(0);
  } else {
    console.log('Firebase integration tests failed!');
    process.exit(1);
  }
}).catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
});
"

echo "Test execution completed!"