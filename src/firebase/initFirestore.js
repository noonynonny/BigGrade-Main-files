// Script to initialize Firestore database with required collections
import { db } from './config';
import { 
  collection, 
  doc, 
  setDoc,
  getDoc
} from 'firebase/firestore';

// Initialize Firestore with required collections and sample data
export const initializeFirestore = async () => {
  console.log('Initializing Firestore database...');
  
  try {
    // Check if initialization has already been done
    const initDocRef = doc(db, 'metadata', 'initialization');
    const initDocSnap = await getDoc(initDocRef);
    
    if (initDocSnap.exists()) {
      console.log('Firestore already initialized');
      return;
    }
    
    // Create sample documents to initialize collections
    console.log('Creating collections...');
    
    // Users collection
    const userDocRef = doc(collection(db, 'users'));
    await setDoc(userDocRef, {
      full_name: 'Sample User',
      email: 'sample@example.com',
      created_date: new Date().toISOString()
    });
    await deleteDoc(userDocRef); // Clean up sample document
    
    // Megathreads collection
    const megathreadDocRef = doc(collection(db, 'megathreads'));
    await setDoc(megathreadDocRef, {
      title: 'Sample Megathread',
      content: 'This is a sample megathread',
      author_type: 'student',
      author_name: 'Sample User',
      created_date: new Date().toISOString()
    });
    await deleteDoc(megathreadDocRef); // Clean up sample document
    
    // MarketplaceRequests collection
    const requestDocRef = doc(collection(db, 'marketplaceRequests'));
    await setDoc(requestDocRef, {
      title: 'Sample Request',
      description: 'This is a sample request',
      subject: 'Math',
      price: 20,
      status: 'open',
      author_name: 'Sample User',
      created_date: new Date().toISOString()
    });
    await deleteDoc(requestDocRef); // Clean up sample document
    
    // TutorListings collection
    const tutorDocRef = doc(collection(db, 'tutorListings'));
    await setDoc(tutorDocRef, {
      full_name: 'Sample Tutor',
      subject: 'Math',
      rate: 25,
      bio: 'Experienced math tutor',
      created_date: new Date().toISOString()
    });
    await deleteDoc(tutorDocRef); // Clean up sample document
    
    // Vouches collection
    const vouchDocRef = doc(collection(db, 'vouches'));
    await setDoc(vouchDocRef, {
      gig_id: 'sample_gig_id',
      voucher_email: 'voucher@example.com',
      vouchee_email: 'vouchee@example.com',
      created_date: new Date().toISOString()
    });
    await deleteDoc(vouchDocRef); // Clean up sample document
    
    // ThreadReplies collection
    const replyDocRef = doc(collection(db, 'threadReplies'));
    await setDoc(replyDocRef, {
      content: 'Sample reply',
      megathread_id: 'sample_megathread_id',
      author_name: 'Sample User',
      created_date: new Date().toISOString()
    });
    await deleteDoc(replyDocRef); // Clean up sample document
    
    // Mark initialization as complete
    await setDoc(initDocRef, {
      initialized: true,
      initialized_date: new Date().toISOString()
    });
    
    console.log('Firestore initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing Firestore:', error);
    throw error;
  }
};

export default initializeFirestore;