// Firebase client to replace Base44 client
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot
} from "firebase/firestore";
import { db, auth } from "./config";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";

// Google Sign-In
const googleProvider = new GoogleAuthProvider();

export const firebaseClient = {
  // Authentication
  auth: {
    signInWithGoogle: () => signInWithPopup(auth, googleProvider),
    signOut: () => signOut(auth),
    onAuthStateChanged: (callback) => onAuthStateChanged(auth, callback),
    getCurrentUser: () => auth.currentUser
  },

  // Entities (replacing Base44 entities)
  entities: {
    // User operations
    User: {
      get: async (userId) => {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
      },
      
      create: async (userData) => {
        const user = auth.currentUser;
        if (!user) throw new Error("No authenticated user");
        
        const docRef = doc(db, "users", user.uid);
        await setDoc(docRef, userData);
        return { id: user.uid, ...userData };
      },
      
      update: async (userId, userData) => {
        const docRef = doc(db, "users", userId);
        await updateDoc(docRef, userData);
        return { id: userId, ...userData };
      },
      
      filter: async (filters) => {
        // This is a simplified implementation
        // For complex filtering, you might need to use Firestore queries
        const q = query(collection(db, "users"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    },

    // Megathread operations
    Megathread: {
      get: async (id) => {
        const docRef = doc(db, "megathreads", id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
      },
      
      create: async (data) => {
        const docRef = await addDoc(collection(db, "megathreads"), data);
        return { id: docRef.id, ...data };
      },
      
      update: async (id, data) => {
        const docRef = doc(db, "megathreads", id);
        await updateDoc(docRef, data);
        return { id, ...data };
      },
      
      delete: async (id) => {
        const docRef = doc(db, "megathreads", id);
        await deleteDoc(docRef);
      },
      
      filter: async (filters, orderByField = "-created_date", limitCount = 50) => {
        let q = query(collection(db, "megathreads"));
        
        // Apply filters
        if (filters) {
          Object.keys(filters).forEach(key => {
            q = query(q, where(key, "==", filters[key]));
          });
        }
        
        // Apply ordering
        if (orderByField) {
          const isDesc = orderByField.startsWith('-');
          const field = isDesc ? orderByField.substring(1) : orderByField;
          q = query(q, orderBy(field, isDesc ? "desc" : "asc"));
        }
        
        // Apply limit
        if (limitCount) {
          q = query(q, limit(limitCount));
        }
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      
      subscribe: (filters, callback) => {
        let q = query(collection(db, "megathreads"));
        
        // Apply filters
        if (filters) {
          Object.keys(filters).forEach(key => {
            q = query(q, where(key, "==", filters[key]));
          });
        }
        
        // Apply ordering
        q = query(q, orderBy("created_date", "desc"));
        
        return onSnapshot(q, (querySnapshot) => {
          const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          callback(data);
        });
      }
    },

    // MarketplaceRequest operations
    MarketplaceRequest: {
      get: async (id) => {
        const docRef = doc(db, "marketplaceRequests", id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
      },
      
      create: async (data) => {
        const docRef = await addDoc(collection(db, "marketplaceRequests"), data);
        return { id: docRef.id, ...data };
      },
      
      update: async (id, data) => {
        const docRef = doc(db, "marketplaceRequests", id);
        await updateDoc(docRef, data);
        return { id, ...data };
      },
      
      filter: async (filters, orderByField = "-created_date", limitCount = 50) => {
        let q = query(collection(db, "marketplaceRequests"));
        
        // Apply filters
        if (filters) {
          Object.keys(filters).forEach(key => {
            q = query(q, where(key, "==", filters[key]));
          });
        }
        
        // Apply ordering
        if (orderByField) {
          const isDesc = orderByField.startsWith('-');
          const field = isDesc ? orderByField.substring(1) : orderByField;
          q = query(q, orderBy(field, isDesc ? "desc" : "asc"));
        }
        
        // Apply limit
        if (limitCount) {
          q = query(q, limit(limitCount));
        }
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    },

    // TutorListing operations
    TutorListing: {
      get: async (id) => {
        const docRef = doc(db, "tutorListings", id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
      },
      
      create: async (data) => {
        const docRef = await addDoc(collection(db, "tutorListings"), data);
        return { id: docRef.id, ...data };
      },
      
      update: async (id, data) => {
        const docRef = doc(db, "tutorListings", id);
        await updateDoc(docRef, data);
        return { id, ...data };
      },
      
      filter: async (filters, orderByField = "-created_date", limitCount = 50) => {
        let q = query(collection(db, "tutorListings"));
        
        // Apply filters
        if (filters) {
          Object.keys(filters).forEach(key => {
            q = query(q, where(key, "==", filters[key]));
          });
        }
        
        // Apply ordering
        if (orderByField) {
          const isDesc = orderByField.startsWith('-');
          const field = isDesc ? orderByField.substring(1) : orderByField;
          q = query(q, orderBy(field, isDesc ? "desc" : "asc"));
        }
        
        // Apply limit
        if (limitCount) {
          q = query(q, limit(limitCount));
        }
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    },

    // Vouch operations
    Vouch: {
      get: async (id) => {
        const docRef = doc(db, "vouches", id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
      },
      
      create: async (data) => {
        const docRef = await addDoc(collection(db, "vouches"), data);
        return { id: docRef.id, ...data };
      },
      
      filter: async (filters) => {
        let q = query(collection(db, "vouches"));
        
        // Apply filters
        if (filters) {
          Object.keys(filters).forEach(key => {
            q = query(q, where(key, "==", filters[key]));
          });
        }
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    },

    // ThreadReply operations
    ThreadReply: {
      get: async (id) => {
        const docRef = doc(db, "threadReplies", id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
      },
      
      create: async (data) => {
        const docRef = await addDoc(collection(db, "threadReplies"), data);
        return { id: docRef.id, ...data };
      },
      
      filter: async (filters, orderByField = "-created_date", limitCount = 50) => {
        let q = query(collection(db, "threadReplies"));
        
        // Apply filters
        if (filters) {
          Object.keys(filters).forEach(key => {
            q = query(q, where(key, "==", filters[key]));
          });
        }
        
        // Apply ordering
        if (orderByField) {
          const isDesc = orderByField.startsWith('-');
          const field = isDesc ? orderByField.substring(1) : orderByField;
          q = query(q, orderBy(field, isDesc ? "desc" : "asc"));
        }
        
        // Apply limit
        if (limitCount) {
          q = query(q, limit(limitCount));
        }
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      
      // Subscribe to real-time updates
      subscribe: (filters, callback) => {
        let q = query(collection(db, "threadReplies"));
        
        // Apply filters
        if (filters) {
          Object.keys(filters).forEach(key => {
            q = query(q, where(key, "==", filters[key]));
          });
        }
        
        // Apply ordering
        q = query(q, orderBy("created_date", "desc"));
        
        return onSnapshot(q, (querySnapshot) => {
          const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          callback(data);
        });
      }
    },

    // Additional entities would follow the same pattern...
    // PublicUserDirectory, ChatMessage, GlobalChatMessage, etc.
  }
};

export default firebaseClient;