// Authentication Manager
// Combines Firebase Authentication with Base44 User Data

import { firebaseAuth } from './firebaseAuth';
import { base44 } from './base44Client';

const ADMIN_EMAIL = 'arcanimater@gmail.com';

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.userProfile = null;
    this.listeners = [];
  }

  // Initialize and listen to Firebase auth changes
  initialize() {
    return firebaseAuth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in with Firebase
        await this.loadUserProfile(firebaseUser);
      } else {
        // User is signed out
        this.currentUser = null;
        this.userProfile = null;
      }
      
      // Notify all listeners
      this.notifyListeners();
    });
  }

  // Load user profile from Base44
  async loadUserProfile(firebaseUser) {
    try {
      // Check if user exists in PublicUserDirectory
      const users = await base44.PublicUserDirectory.filter({ 
        user_email: firebaseUser.email 
      });
      
      let userProfile = users.length > 0 ? users[0] : null;
      
      // Check if this is admin
      const isAdmin = firebaseAuth.isAdmin(firebaseUser.email);
      
      this.currentUser = firebaseUser;
      this.userProfile = userProfile;
      
      // Store combined user data
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || userProfile?.full_name || firebaseUser.email.split('@')[0],
        photoURL: firebaseUser.photoURL || userProfile?.avatar_url || null,
        userType: userProfile?.user_type || null,
        isAdmin: isAdmin,
        base44Profile: userProfile
      };
      
      localStorage.setItem('biggrade_user', JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }

  // Get current user data
  getCurrentUser() {
    const stored = localStorage.getItem('biggrade_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        localStorage.removeItem('biggrade_user');
      }
    }
    return null;
  }

  // Sign up with email and password
  async signUp(email, password, displayName) {
    try {
      const firebaseUser = await firebaseAuth.signUpWithEmail(email, password);
      
      // Return user without profile - they need to select account type first
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: displayName || firebaseUser.email.split('@')[0],
        photoURL: null,
        userType: null,
        isAdmin: firebaseAuth.isAdmin(email),
        needsAccountType: true
      };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  // Complete signup by setting account type
  async completeSignup(userType) {
    const firebaseUser = firebaseAuth.getCurrentUser();
    if (!firebaseUser) {
      throw new Error('No authenticated user');
    }

    try {
      // Create user profile in Base44
      const userProfile = await base44.PublicUserDirectory.create({
        user_email: firebaseUser.email,
        user_id: firebaseUser.uid,
        full_name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        user_type: userType, // 'student' or 'tutor'
        avatar_url: firebaseUser.photoURL || null,
        last_active: new Date().toISOString(),
        tutor_rating: 0,
        student_rating: 0,
        peer_points: 0,
        is_qualified_teacher: false,
        role: firebaseAuth.isAdmin(firebaseUser.email) ? 'admin' : 'user'
      });

      // Reload user profile
      return await this.loadUserProfile(firebaseUser);
    } catch (error) {
      console.error('Complete signup error:', error);
      throw error;
    }
  }

  // Sign in with email and password
  async signInWithEmail(email, password) {
    try {
      const firebaseUser = await firebaseAuth.signInWithEmail(email, password);
      return await this.loadUserProfile(firebaseUser);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const firebaseUser = await firebaseAuth.signInWithGoogle();
      
      // Check if user already has a profile
      const users = await base44.PublicUserDirectory.filter({ 
        user_email: firebaseUser.email 
      });
      
      if (users.length === 0) {
        // New Google user - needs to select account type
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          photoURL: firebaseUser.photoURL,
          userType: null,
          isAdmin: firebaseAuth.isAdmin(firebaseUser.email),
          needsAccountType: true
        };
      }
      
      // Existing user - load profile
      return await this.loadUserProfile(firebaseUser);
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }

  // Send password reset email
  async sendPasswordReset(email) {
    try {
      await firebaseAuth.sendPasswordReset(email);
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  // Sign out
  async signOut() {
    try {
      await firebaseAuth.signOut();
      localStorage.removeItem('biggrade_user');
      this.currentUser = null;
      this.userProfile = null;
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Add listener for auth state changes
  addListener(callback) {
    this.listeners.push(callback);
  }

  // Remove listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  // Notify all listeners
  notifyListeners() {
    const user = this.getCurrentUser();
    this.listeners.forEach(callback => callback(user));
  }
}

// Create singleton instance
const authManager = new AuthManager();

export default authManager;
export { authManager, ADMIN_EMAIL };
