# BigGrade Deployment Guide

This guide will help you deploy your BigGrade application to Netlify with Firebase and Base44 API integration.

## 🚀 Quick Setup

### Prerequisites
1. **Firebase Project**: Create a Firebase project at https://console.firebase.google.com
2. **Base44 Account**: Create a Base44 account at https://app.base44.com
3. **Netlify Account**: Create a Netlify account at https://netlify.com

### Step 1: Firebase Setup
1. Go to Firebase Console → Project Settings
2. Add a new Web App
3. Copy the Firebase configuration
4. Enable Authentication (Email/Password and Anonymous)
5. Create Firestore Database in test mode
6. Update environment variables in Netlify

### Step 2: Base44 Setup
1. Create a new app in Base44 dashboard
2. Get your API Key and App ID
3. Add these to your Netlify environment variables

### Step 3: Netlify Deployment
1. Connect your GitHub repository to Netlify
2. Set the following environment variables in Netlify:

#### Firebase Environment Variables
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Base44 Environment Variables
```
VITE_BASE44_API_KEY=your_base44_api_key
VITE_BASE44_APP_ID=your_base44_app_id
```

3. Deploy the site

## 🔧 Development Setup

### Local Development
1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your credentials
3. Install dependencies:
   ```bash
   npm install
   cd base44-proxy && npm install && cd ..
   ```
4. Start the development server:
   ```bash
   # Start the proxy server
   cd base44-proxy && npm start &

   # Start the React app
   npm start
   ```

### Proxy Server
The proxy server runs on `http://localhost:3001` and handles Base44 API calls to bypass CORS issues.

## 📁 Project Structure

```
BigGrade-Main-files/
├── src/
│   ├── firebaseClient.js    # Firebase configuration and Base44 replacement
│   ├── api/
│   │   └── index.js         # API utilities for Firebase and Base44
│   ├── utils.js             # Utility functions
│   └── ...                  # React components and pages
├── base44-proxy/
│   ├── server.js            # Development proxy server
│   └── package.json         # Proxy dependencies
├── netlify/
│   └── functions/
│       └── base44-proxy.js  # Production proxy function
├── netlify.toml             # Netlify configuration
├── package.json             # Main dependencies
└── .env.example             # Environment variables template
```

## 🔍 How It Works

### Firebase Integration
- The `firebaseClient.js` file provides a Base44-compatible API using Firebase
- All database operations are automatically routed to Firebase Firestore
- Authentication is handled through Firebase Auth

### Base44 API Proxy
- Development: Local proxy server on port 3001
- Production: Netlify Functions proxy
- Handles CORS issues and API key management

### API Calls
```javascript
import { api } from './api';

// Create a user
const user = await api.createUser({ name: 'John Doe', email: 'john@example.com' });

// Get gigs
const gigs = await api.getGigs({ where: [{ field: 'status', operator: '==', value: 'active' }] });
```

## 🐛 Troubleshooting

### Build Errors
- **Firebase not found**: Make sure Firebase is installed: `npm install firebase`
- **Environment variables not found**: Check `.env` file for development and Netlify environment variables for production

### Runtime Errors
- **Permission denied**: Check Firebase security rules
- **API key not found**: Verify Base44 credentials in environment variables

### Proxy Issues
- **CORS errors**: Ensure proxy server is running in development
- **404 errors**: Check Netlify Functions are deployed correctly

## 🔒 Security Considerations

1. **Environment Variables**: Never commit API keys to Git
2. **Firebase Rules**: Update Firestore security rules for production
3. **CORS**: Proxy server only allows specific origins

## 📈 Production Checklist

- [ ] Firebase security rules updated
- [ ] All environment variables set in Netlify
- [ ] Build process works correctly
- [ ] API endpoints tested
- [ ] Proxy functions deployed
- [ ] CORS issues resolved

## 🆘 Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify environment variables are correctly set
3. Ensure all dependencies are installed
4. Check Netlify build logs for deployment issues

## 🔄 Updates

To update the application:
1. Push changes to GitHub
2. Netlify will automatically rebuild and deploy
3. Test the new functionality

The application is now ready for production deployment on Netlify!