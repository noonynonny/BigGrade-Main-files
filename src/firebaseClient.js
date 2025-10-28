// Firebase client that mimics the base44 API structure
import { auth, db } from "./firebase/config";
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
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";

// Google Sign-In
const googleProvider = new GoogleAuthProvider();

// Create a client object that mimics the base44 structure
export const firebaseClient = {
  auth: {
    me: async () => {
      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          if (user) {
            resolve({
              id: user.uid,
              email: user.email,
              full_name: user.displayName,
              photoURL: user.photoURL
            });
          } else {
            resolve(null);
          }
        });
      });
    },
    signInWithGoogle: () => signInWithPopup(auth, googleProvider),
    signOut: () => signOut(auth),
  },
  
  entities: {
    User: {
      filter: async (filters) => {
        let q = query(collection(db, "users"));
        if (filters) {
          Object.keys(filters).forEach(key => {
            q = query(q, where(key, "==", filters[key]));
          });
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      list: async (orderByField, limitCount) => {
        let q = query(collection(db, "users"));
        if (orderByField) {
          const isDesc = orderByField.startsWith('-');
          const field = isDesc ? orderByField.substring(1) : orderByField;
          q = query(q, orderBy(field, isDesc ? "desc" : "asc"));
        }
        if (limitCount) {
          q = query(q, limit(limitCount));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      get: async (id) => {
        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
      },
      create: async (data) => {
        const docRef = await addDoc(collection(db, "users"), data);
        return { id: docRef.id, ...data };
      },
      update: async (id, data) => {
        const docRef = doc(db, "users", id);
        await updateDoc(docRef, data);
        return { id, ...data };
      },
      delete: async (id) => {
        const docRef = doc(db, "users", id);
        await deleteDoc(docRef);
      }
    },
    
    MarketplaceRequest: {
      filter: async (filters, orderByField, limitCount) => {
        let q = query(collection(db, "marketplaceRequests"));
        if (filters) {
          Object.keys(filters).forEach(key => {
            q = query(q, where(key, "==", filters[key]));
          });
        }
        if (orderByField) {
          const isDesc = orderByField.startsWith('-');
          const field = isDesc ? orderByField.substring(1) : orderByField;
          q = query(q, orderBy(field, isDesc ? "desc" : "asc"));
        }
        if (limitCount) {
          q = query(q, limit(limitCount));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      list: async (orderByField, limitCount) => {
        let q = query(collection(db, "marketplaceRequests"));
        if (orderByField) {
          const isDesc = orderByField.startsWith('-');
          const field = isDesc ? orderByField.substring(1) : orderByField;
          q = query(q, orderBy(field, isDesc ? "desc" : "asc"));
        }
        if (limitCount) {
          q = query(q, limit(limitCount));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
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
      delete: async (id) => {
        const docRef = doc(db, "marketplaceRequests", id);
        await deleteDoc(docRef);
      }
    },
    
    Megathread: {
      filter: async (filters, orderByField, limitCount) => {
        let q = query(collection(db, "megathreads"));
        if (filters) {
          Object.keys(filters).forEach(key => {
            q = query(q, where(key, "==", filters[key]));
          });
        }
        if (orderByField) {
          const isDesc = orderByField.startsWith('-');
          const field = isDesc ? orderByField.substring(1) : orderByField;
          q = query(q, orderBy(field, isDesc ? "desc" : "asc"));
        }
        if (limitCount) {
          q = query(q, limit(limitCount));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      list: async (orderByField, limitCount) => {
        let q = query(collection(db, "megathreads"));
        if (orderByField) {
          const isDesc = orderByField.startsWith('-');
          const field = isDesc ? orderByField.substring(1) : orderByField;
          q = query(q, orderBy(field, isDesc ? "desc" : "asc"));
        }
        if (limitCount) {
          q = query(q, limit(limitCount));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
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
      }
    },
    
    NewsPost: {
      filter: async (filters, orderByField, limitCount) => {
        let q = query(collection(db, "newsPosts"));
        if (filters) {
          Object.keys(filters).forEach(key => {
            q = query(q, where(key, "==", filters[key]));
          });
        }
        if (orderByField) {
          const isDesc = orderByField.startsWith('-');
          const field = isDesc ? orderByField.substring(1) : orderByField;
          q = query(q, orderBy(field, isDesc ? "desc" : "asc"));
        }
        if (limitCount) {
          q = query(q, limit(limitCount));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      list: async (orderByField, limitCount) => {
        let q = query(collection(db, "newsPosts"));
        if (orderByField) {
          const isDesc = orderByField.startsWith('-');
          const field = isDesc ? orderByField.substring(1) : orderByField;
          q = query(q, orderBy(field, isDesc ? "desc" : "asc"));
        }
        if (limitCount) {
          q = query(q, limit(limitCount));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      get: async (id) => {
        const docRef = doc(db, "newsPosts", id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
      },
      create: async (data) => {
        const docRef = await addDoc(collection(db, "newsPosts"), data);
        return { id: docRef.id, ...data };
      },
      update: async (id, data) => {
        const docRef = doc(db, "newsPosts", id);
        await updateDoc(docRef, data);
        return { id, ...data };
      },
      delete: async (id) => {
        const docRef = doc(db, "newsPosts", id);
        await deleteDoc(docRef);
      }
    },
    
    PublicUserDirectory: {
      filter: async (filters) => {
        let q = query(collection(db, "publicUserDirectory"));
        if (filters) {
          Object.keys(filters).forEach(key => {
            q = query(q, where(key, "==", filters[key]));
          });
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      list: async (orderByField, limitCount) => {
        let q = query(collection(db, "publicUserDirectory"));
        if (orderByField) {
          const isDesc = orderByField.startsWith('-');
          const field = isDesc ? orderByField.substring(1) : orderByField;
          q = query(q, orderBy(field, isDesc ? "desc" : "asc"));
        }
        if (limitCount) {
          q = query(q, limit(limitCount));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    },
    
    ChatMessage: {
      filter: async (filters, orderByField, limitCount) => {
        let q = query(collection(db, "chatMessages"));
        if (filters) {
          Object.keys(filters).forEach(key => {
            q = query(q, where(key, "==", filters[key]));
          });
        }
        if (orderByField) {
          const isDesc = orderByField.startsWith('-');
          const field = isDesc ? orderByField.substring(1) : orderByField;
          q = query(q, orderBy(field, isDesc ? "desc" : "asc"));
        }
        if (limitCount) {
          q = query(q, limit(limitCount));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      list: async (orderByField, limitCount) => {
        let q = query(collection(db, "chatMessages"));
        if (orderByField) {
          const isDesc = orderByField.startsWith('-');
          const field = isDesc ? orderByField.substring(1) : orderByField;
          q = query(q, orderBy(field, isDesc ? "desc" : "asc"));
        }
        if (limitCount) {
          q = query(q, limit(limitCount));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      get: async (id) => {
        const docRef = doc(db, "chatMessages", id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
      },
      create: async (data) => {
        const docRef = await addDoc(collection(db, "chatMessages"), data);
        return { id: docRef.id, ...data };
      },
      update: async (id, data) => {
        const docRef = doc(db, "chatMessages", id);
        await updateDoc(docRef, data);
        return { id, ...data };
      }
    },
    
    GlobalChatMessage: {
      filter: async (filters, orderByField, limitCount) => {
        let q = query(collection(db, "globalChatMessages"));
        if (filters) {
          Object.keys(filters).forEach(key => {
            q = query(q, where(key, "==", filters[key]));
          });
        }
        if (orderByField) {
          const isDesc = orderByField.startsWith('-');
          const field = isDesc ? orderByField.substring(1) : orderByField;
          q = query(q, orderBy(field, isDesc ? "desc" : "asc"));
        }
        if (limitCount) {
          q = query(q, limit(limitCount));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      list: async (orderByField, limitCount) => {
        let q = query(collection(db, "globalChatMessages"));
        if (orderByField) {
          const isDesc = orderByField.startsWith('-');
          const field = isDesc ? orderByField.substring(1) : orderByField;
          q = query(q, orderBy(field, isDesc ? "desc" : "asc"));
        }
        if (limitCount) {
          q = query(q, limit(limitCount));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      get: async (id) => {
        const docRef = doc(db, "globalChatMessages", id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
      },
      create: async (data) => {
        const docRef = await addDoc(collection(db, "globalChatMessages"), data);
        return { id: docRef.id, ...data };
      }
    },
    
    SessionChat: {
      filter: async (filters, orderByField, limitCount) => {
        let q = query(collection(db, "sessionChats"));
        if (filters) {
          Object.keys(filters).forEach(key => {
            q = query(q, where(key, "==", filters[key]));
          });
        }
        if (orderByField) {
          const isDesc = orderByField.startsWith('-');
          const field = isDesc ? orderByField.substring(1) : orderByField;
          q = query(q, orderBy(field, isDesc ? "desc" : "asc"));
        }
        if (limitCount) {
          q = query(q, limit(limitCount));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      list: async (orderByField, limitCount) => {
        let q = query(collection(db, "sessionChats"));
        if (orderByField) {
          const isDesc = orderByField.startsWith('-');
          const field = isDesc ? orderByField.substring(1) : orderByField;
          q = query(q, orderBy(field, isDesc ? "desc" : "asc"));
        }
        if (limitCount) {
          q = query(q, limit(limitCount));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      get: async (id) => {
        const docRef = doc(db, "sessionChats", id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
      },
      create: async (data) => {
        const docRef = await addDoc(collection(db, "sessionChats"), data);
        return { id: docRef.id, ...data };
      }
    },
    
    SessionNotification: {
      filter: async (filters, orderByField, limitCount) => {
        let q = query(collection(db, "sessionNotifications"));
        if (filters) {
          Object.keys(filters).forEach(key => {
            q = query(q, where(key, "==", filters[key]));
          });
        }
        if (orderByField) {
          const isDesc = orderByField.startsWith('-');
          const field = isDesc ? orderByField.substring(1) : orderByField;
          q = query(q, orderBy(field, isDesc ? "desc" : "asc"));
        }
        if (limitCount) {
          q = query(q, limit(limitCount));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      list: async (orderByField, limitCount) => {
        let q = query(collection(db, "sessionNotifications"));
        if (orderByField) {
          const isDesc = orderByField.startsWith('-');
          const field = isDesc ? orderByField.substring(1) : orderByField;
          q = query(q, orderBy(field, isDesc ? "desc" : "asc"));
        }
        if (limitCount) {
          q = query(q, limit(limitCount));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      get: async (id) => {
        const docRef = doc(db, "sessionNotifications", id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
      },
      create: async (data) => {
        const docRef = await addDoc(collection(db, "sessionNotifications"), data);
        return { id: docRef.id, ...data };
      },
      update: async (id, data) => {
        const docRef = doc(db, "sessionNotifications", id);
        await updateDoc(docRef, data);
        return { id, ...data };
      }
    },
    
    TutorListing: {
      filter: async (filters, orderByField, limitCount) => {
        let q = query(collection(db, "tutorListings"));
        if (filters) {
          Object.keys(filters).forEach(key => {
            q = query(q, where(key, "==", filters[key]));
          });
        }
        if (orderByField) {
          const isDesc = orderByField.startsWith('-');
          const field = isDesc ? orderByField.substring(1) : orderByField;
          q = query(q, orderBy(field, isDesc ? "desc" : "asc"));
        }
        if (limitCount) {
          q = query(q, limit(limitCount));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      list: async (orderByField, limitCount) => {
        let q = query(collection(db, "tutorListings"));
        if (orderByField) {
          const isDesc = orderByField.startsWith('-');
          const field = isDesc ? orderByField.substring(1) : orderByField;
          q = query(q, orderBy(field, isDesc ? "desc" : "asc"));
        }
        if (limitCount) {
          q = query(q, limit(limitCount));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
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
      delete: async (id) => {
        const docRef = doc(db, "tutorListings", id);
        await deleteDoc(docRef);
      }
    },
    
    Vouch: {
      filter: async (filters) => {
        let q = query(collection(db, "vouches"));
        if (filters) {
          Object.keys(filters).forEach(key => {
            q = query(q, where(key, "==", filters[key]));
          });
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      list: async (orderByField, limitCount) => {
        let q = query(collection(db, "vouches"));
        if (orderByField) {
          const isDesc = orderByField.startsWith('-');
          const field = isDesc ? orderByField.substring(1) : orderByField;
          q = query(q, orderBy(field, isDesc ? "desc" : "asc"));
        }
        if (limitCount) {
          q = query(q, limit(limitCount));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      get: async (id) => {
        const docRef = doc(db, "vouches", id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
      },
      create: async (data) => {
        const docRef = await addDoc(collection(db, "vouches"), data);
        return { id: docRef.id, ...data };
      }
    }
  }
};

// Export the client as base44 to maintain compatibility with existing code
export const base44 = firebaseClient;

export default firebaseClient;