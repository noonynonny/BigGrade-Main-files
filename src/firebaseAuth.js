// Firebase Authentication Configuration
// This handles ONLY authentication (Google OAuth + Email/Password)
// All data operations use Base44 API

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGRLpWL0uhCP2McjerNu7PR0bxRanIto4",
  authDomain: "biggrade-75a91.firebaseapp.com",
  projectId: "biggrade-75a91",
  storageBucket: "biggrade-75a91.firebasestorage.app",
  messagingSenderId: "134616128547",
  appId: "1:134616128547:web:735490d746f411b33a2596",
  measurementId: "G-B7BC52DN8V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Admin email
const ADMIN_EMAIL = 'arcanimater@gmail.com';

// Firebase Auth wrapper
export const firebaseAuth = {
  // Get current Firebase user
  getCurrentUser() {
    return auth.currentUser;
  },

  // Check if user is admin
  isAdmin(email) {
    return email === ADMIN_EMAIL;
  },

  // Sign in with email and password
  async signInWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Email sign in error:', error);
      throw error;
    }
  },

  // Sign up with email and password
  async signUpWithEmail(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Email sign up error:', error);
      throw error;
    }
  },

  // Sign in with Google (using redirect for better compatibility)
  async signInWithGoogle() {
    try {
      // Use redirect instead of popup to avoid CORS issues
      const { signInWithRedirect } = await import('firebase/auth');
      await signInWithRedirect(auth, googleProvider);
      // The page will reload after redirect, so we don't return here
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  },

  // Get redirect result after Google sign in
  async getRedirectResult() {
    try {
      const { getRedirectResult } = await import('firebase/auth');
      const result = await getRedirectResult(auth);
      return result?.user || null;
    } catch (error) {
      console.error('Redirect result error:', error);
      return null;
    }
  },

  // Send password reset email
  async sendPasswordReset(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  },

  // Sign out
  async signOut() {
    try {
      await firebaseSignOut(auth);
      return true;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }
};

export { auth };
export default firebaseAuth;
