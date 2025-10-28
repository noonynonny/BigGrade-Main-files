# Deploying BigGrade to Netlify

This guide explains how to deploy the Firebase-powered BigGrade application to Netlify.

## Prerequisites

1. A Netlify account
2. A Firebase project with:
   - Firebase Authentication enabled
   - Cloud Firestore database
   - Firebase Storage (if using file uploads)

## Setup Instructions

### 1. Configure Firebase

Make sure you have enabled the following services in your Firebase project:

1. **Authentication**
   - Enable Google Sign-In provider
   - Add your Netlify domain to authorized domains

2. **Firestore Database**
   - Create database in production mode
   - Set up security rules (see `firebase.rules`)

3. **Storage** (if needed)
   - Enable Firebase Storage
   - Configure security rules

### 2. Update Environment Variables

In your Netlify project settings, add the following environment variables:

```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 3. Connect to Netlify

1. Go to [Netlify](https://app.netlify.com/)
2. Click "New site from Git"
3. Connect to your GitHub account
4. Select your BigGrade repository
5. Configure the deployment settings:
   - Branch to deploy: `main`
   - Build command: `npm run build`
   - Publish directory: `build`

### 4. Deploy

Click "Deploy site" and Netlify will automatically build and deploy your application.

## Netlify Configuration

The `netlify.toml` file in the root of the project configures:

- Build command: `npm run build`
- Publish directory: `build`
- Redirects for client-side routing

## Environment Variables

Netlify will automatically inject the environment variables you set in the dashboard into the build process.

## Custom Domain

To use a custom domain:

1. Go to your site settings in Netlify
2. Click "Domain management"
3. Add your custom domain
4. Follow the DNS configuration instructions

## Troubleshooting

### Build Issues

If you encounter build issues:

1. Check that all environment variables are correctly set
2. Verify Firebase configuration values
3. Check the build logs in Netlify for specific error messages

### Runtime Issues

If the deployed site doesn't work correctly:

1. Check browser console for JavaScript errors
2. Verify Firebase security rules
3. Ensure your domain is added to Firebase authorized domains

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

## Firebase Security Rules

The `firebase.rules` file contains basic security rules for Firestore. For production, you should review and tighten these rules.

## Support

For issues with deployment, check:
1. Netlify build logs
2. Browser console errors
3. Firebase console for security rule violations