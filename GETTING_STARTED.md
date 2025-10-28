# Getting Started with BigGrade Firebase Version

This guide will help you set up and run the Firebase version of BigGrade.

## Prerequisites

1. Node.js (version 14 or higher)
2. npm (comes with Node.js)
3. A Firebase account
4. Google account for authentication

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd BigGrade-Main-files
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter "BigGrade" as the project name
4. Accept the terms and conditions
5. Enable Google Analytics if desired
6. Click "Create project"

### 4. Register Your Web App

1. In the Firebase Console, click the web icon (</>) to register a new app
2. Enter "BigGrade" as the app name
3. Check "Also set up Firebase Hosting for this app"
4. Click "Register app"
5. Copy the Firebase configuration object

### 5. Configure Firebase

Create a `.env` file in the root directory with your Firebase configuration:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 6. Enable Firebase Services

#### Enable Authentication
1. In the Firebase Console, click "Authentication" in the left sidebar
2. Click "Get started"
3. Click the "Sign-in method" tab
4. Enable "Google" as a sign-in provider

#### Enable Cloud Firestore
1. In the Firebase Console, click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Select "Start in test mode" (for development only)
4. Choose a location near you
5. Click "Enable"

### 7. Run the Application

```bash
npm start
```

The application will be available at `http://localhost:3000`

## Development

### Project Structure

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

### Key Files

- `src/firebase/config.js` - Firebase initialization
- `src/firebase/firebaseClient.js` - Firebase client implementation
- `Layout.js` - Main application layout
- `src/App.js` - Routing configuration

## Testing

### Run Firebase Integration Tests

```bash
./test.sh
```

### Manual Testing

1. Test Google Sign-In functionality
2. Create and view megathreads
3. Verify real-time updates work
4. Test profile management

## Deployment

### Deploy to Firebase Hosting

1. Initialize Firebase project:
   ```bash
   ./init-firebase.sh
   ```

2. Build the application:
   ```bash
   npm run build
   ```

3. Deploy to Firebase Hosting:
   ```bash
   ./deploy.sh
   ```

## Troubleshooting

### Common Issues

1. **Firebase configuration not found**
   - Ensure you have created a `.env` file with your Firebase configuration

2. **Authentication not working**
   - Verify that Google Sign-In is enabled in Firebase Console
   - Check that your domain is added to authorized domains

3. **Firestore permissions error**
   - Check Firestore security rules in `firebase.rules`
   - For development, ensure rules allow read/write access

### Getting Help

- Check the Firebase Console for error logs
- Review the browser console for client-side errors
- Refer to Firebase documentation for service-specific issues

## Next Steps

1. Review and tighten Firestore security rules for production
2. Set up custom domain for Firebase Hosting
3. Implement Firebase Cloud Functions for backend logic
4. Add Firebase Performance Monitoring
5. Configure Firebase Analytics

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [React Query Documentation](https://tanstack.com/query/latest)