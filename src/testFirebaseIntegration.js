// Test script to verify Firebase integration
import { auth, db } from './firebase/config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth';

// Test functions
export const runFirebaseTests = async () => {
  console.log('Starting Firebase integration tests...');
  
  try {
    // Test 1: Check authentication state
    console.log('Test 1: Checking authentication state...');
    const user = await new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
    });
    console.log('Current user:', user ? user.email : 'Not signed in');
    
    // Test 2: Write to Firestore
    console.log('Test 2: Writing to Firestore...');
    const testDoc = {
      title: 'Firebase Integration Test',
      content: 'This is a test document created during integration testing',
      author: user ? user.uid : 'anonymous',
      created_date: new Date().toISOString(),
      test_field: 'test_value'
    };
    
    const docRef = await addDoc(collection(db, 'testCollection'), testDoc);
    console.log('Document written with ID:', docRef.id);
    
    // Test 3: Read from Firestore
    console.log('Test 3: Reading from Firestore...');
    const q = query(collection(db, 'testCollection'), where('test_field', '==', 'test_value'));
    const querySnapshot = await getDocs(q);
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    console.log('Retrieved documents:', results);
    
    // Test 4: Delete test document
    console.log('Test 4: Cleaning up test document...');
    await deleteDoc(doc(db, 'testCollection', docRef.id));
    console.log('Test document deleted');
    
    console.log('All Firebase integration tests completed successfully!');
    return true;
  } catch (error) {
    console.error('Firebase integration tests failed:', error);
    return false;
  }
};

// Run tests if this script is executed directly
if (typeof window === 'undefined') {
  // This is Node.js environment
  runFirebaseTests().then(success => {
    if (success) {
      console.log('Firebase integration tests passed!');
    } else {
      console.log('Firebase integration tests failed!');
    }
  });
}

export default runFirebaseTests;