# BigGrade - Firebase Migration

This project is a migration of the BigGrade platform from Base44 to Firebase, ready for deployment to Netlify.

## Overview

BigGrade is a peer-to-peer tutoring platform that connects students with tutors for academic assistance. Originally built on the Base44 platform, this version has been migrated to Firebase to provide better scalability, real-time features, and more robust backend services.

## Features

- Google Sign-In authentication
- Real-time messaging
- Marketplace for tutoring services
- Discussion forums (Megathreads)
- User profiles and directories
- News and announcements
- Leaderboards and endorsements

## Firebase Services Used

- **Firebase Authentication**: For user authentication with Google Sign-In
- **Cloud Firestore**: For real-time database storage
- **Firebase Storage**: For file storage (if needed)

## Project Structure

```
BigGrade-Main-files/
├── Components/          # React components
├── Entities/            # Entity definitions (JSON)
├── Pages/               # Page components
├── public/              # Static assets
├── src/                 # Source code
│   ├── firebase/        # Firebase configuration and client
│   └── utils.js         # Utility functions
├── Layout.js            # Main layout component
├── firebase.json        # Firebase configuration
├── firebase.rules       # Firestore security rules
└── package.json         # Project dependencies
```

## Migration Progress

The migration from Base44 to Firebase is complete for core functionality:

- [x] Firebase project setup
- [x] Authentication with Google Sign-In
- [x] Firestore database integration
- [x] Core page components updated
- [x] Real-time data synchronization
- [x] All page components migrated
- [x] Testing and deployment

## Setup Instructions

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Firebase Authentication, Firestore, and Storage
3. Copy your Firebase configuration to a `.env` file:
   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the development server:
   ```bash
   npm start
   ```

## Deployment to Netlify

This project is configured for deployment to Netlify. See `NETLIFY_DEPLOYMENT.md` for detailed instructions.

### Quick Netlify Deployment

1. Connect your GitHub repository to Netlify
2. Set the build command to: `npm run build`
3. Set the publish directory to: `build`
4. Add your Firebase environment variables in Netlify settings
5. Deploy!

## Local Development

To test the build locally:

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Serve the build locally
npx serve -s build
```

## Support

For issues with the Firebase migration or Netlify deployment, please contact the development team.