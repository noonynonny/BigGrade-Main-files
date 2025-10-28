// Test file to verify Firebase integration
import { auth, db } from './config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth';

// Test Google Sign-In
export const testGoogleSignIn = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    console.log('User signed in:', result.user);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Test Sign Out
export const testSignOut = async () => {
  try {
    await signOut(auth);
    console.log('User signed out');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Test Firestore write
export const testFirestoreWrite = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    console.log('Document written with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
};

// Test Firestore read
export const testFirestoreRead = async (collectionName, filters = {}) => {
  try {
    let q = query(collection(db, collectionName));
    
    // Apply filters if provided
    Object.keys(filters).forEach(key => {
      q = query(q, where(key, '==', filters[key]));
    });
    
    const querySnapshot = await getDocs(q);
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    
    console.log('Documents read:', results);
    return results;
  } catch (error) {
    console.error('Error reading documents:', error);
    throw error;
  }
};

// Test authentication state
export const testAuthState = () => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Run all tests
export const runAllTests = async () => {
  console.log('Running Firebase integration tests...');
  
  try {
    // Test auth state
    const user = await testAuthState();
    console.log('Current user:', user);
    
    // Test Firestore write
    const testDoc = {
      title: 'Test Document',
      content: 'This is a test document',
      author: user ? user.uid : 'anonymous',
      created_date: new Date().toISOString()
    };
    
    const docId = await testFirestoreWrite('testCollection', testDoc);
    console.log('Test document created with ID:', docId);
    
    // Test Firestore read
    const results = await testFirestoreRead('testCollection');
    console.log('Retrieved documents:', results);
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Tests failed:', error);
  }
};