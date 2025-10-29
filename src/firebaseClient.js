// Firebase Client Configuration
// This replaces Base44 functionality for the BigGrade application

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';

// Firebase configuration - these will be loaded from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID || import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

// Base44 replacement functions
export const base44 = {
  // Authentication
  async auth() {
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }
    
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        if (user) {
          resolve({
            uid: user.uid,
            isAuthenticated: true,
            email: user.email,
            displayName: user.displayName
          });
        } else {
          signInAnonymously(auth)
            .then((userCredential) => {
              resolve({
                uid: userCredential.user.uid,
                isAuthenticated: true,
                isAnonymous: true
              });
            })
            .catch(reject);
        }
      });
    });
  },

  // Database operations
  async find(collectionName, options = {}) {
    if (!db) {
      throw new Error('Firebase Firestore not initialized');
    }

    const collectionRef = collection(db, collectionName);
    let q = collectionRef;

    if (options.where) {
      options.where.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
    }

    if (options.orderBy) {
      q = query(q, orderBy(options.orderBy, options.order || 'asc'));
    }

    if (options.limit) {
      q = query(q, limit(options.limit));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async findOne(collectionName, field, value) {
    const results = await this.find(collectionName, { where: [{ field, operator: '==', value }] });
    return results.length > 0 ? results[0] : null;
  },

  async findById(collectionName, id) {
    if (!db) {
      throw new Error('Firebase Firestore not initialized');
    }

    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    return null;
  },

  async create(collectionName, data) {
    if (!db) {
      throw new Error('Firebase Firestore not initialized');
    }

    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return {
      id: docRef.id,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  async update(collectionName, id, data) {
    if (!db) {
      throw new Error('Firebase Firestore not initialized');
    }

    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });

    return {
      id,
      ...data,
      updatedAt: new Date().toISOString()
    };
  },

  async delete(collectionName, id) {
    if (!db) {
      throw new Error('Firebase Firestore not initialized');
    }

    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return { success: true, id };
  }
};

// Export Firebase instances for direct use if needed
export { app, auth, db };

export default base44;