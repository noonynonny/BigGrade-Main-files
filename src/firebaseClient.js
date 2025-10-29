// Firebase Client Configuration
// This replaces Base44 functionality for the BigGrade application

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';

// Base44 API Configuration (from your API files)
const BASE44_CONFIG = {
  apiUrl: 'https://app.base44.com/api/apps/68f3aa9b3f0b7e0b3370d6fc',
  apiKey: '25a08cae07624f7b977e48d02f684891',
  appId: '68f3aa9b3f0b7e0b3370d6fc'
};

// Firebase configuration - handle both development and production environments
const getFirebaseConfig = () => {
  // Try multiple environment variable sources
  const getEnvVar = (name) => {
    return window._env_?.[name] || 
           process.env?.[name] || 
           import.meta.env?.[name] ||
           window.localStorage.getItem(name) ||
           null;
  };

  return {
    apiKey: getEnvVar('VITE_FIREBASE_API_KEY') || 'demo-api-key',
    authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN') || 'demo-project.firebaseapp.com',
    projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID') || 'demo-project',
    storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET') || 'demo-project.appspot.com',
    messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID') || '123456789',
    appId: getEnvVar('VITE_FIREBASE_APP_ID') || 'demo-app-id'
  };
};

// Initialize Firebase
let app = null;
let auth = null;
let db = null;

try {
  const firebaseConfig = getFirebaseConfig();
  
  // Only initialize if we have a real project (not demo values)
  if (firebaseConfig.projectId !== 'demo-project') {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('Firebase initialized successfully');
  } else {
    console.warn('Firebase not initialized - using Base44 authentication fallback.');
    // Set auth to null explicitly to use base44 fallback
    auth = null;
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  auth = null; // Ensure auth is null on error to trigger fallback
}

// Base44 API helper functions
const base44Api = {
  // Make requests to Base44 API
  async request(endpoint, method = 'GET', data = null) {
    const url = `${BASE44_CONFIG.apiUrl}/${endpoint}`;
    const options = {
      method,
      headers: {
        'api_key': BASE44_CONFIG.apiKey,
        'Content-Type': 'application/json'
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Base44 API error:', error);
      throw error;
    }
  },

  // Get entities
  async getEntities(entityType, filters = {}) {
    let url = `entities/${entityType}`;
    const params = new URLSearchParams(filters);
    if (params.toString()) {
      url += '?' + params.toString();
    }
    return this.request(url);
  },

  // Create entity
  async createEntity(entityType, data) {
    return this.request(`entities/${entityType}`, 'POST', data);
  },

  // Update entity
  async updateEntity(entityType, entityId, data) {
    return this.request(`entities/${entityType}/${entityId}`, 'PUT', data);
  },

  // Delete entity
  async deleteEntity(entityType, entityId) {
    return this.request(`entities/${entityType}/${entityId}`, 'DELETE');
  }
};

// Base44 replacement functions
export const base44 = {
  // Authentication (use Base44 or fallback)
  async auth() {
    // For now, return a simple auth object
    // In production, this should integrate with your auth system
    return {
      uid: 'anonymous-user-' + Math.random().toString(36).substr(2, 9),
      isAuthenticated: true,
      email: 'anonymous@example.com',
      displayName: 'Anonymous User'
    };
  },

  // Database operations using Base44 API
  async find(collectionName, options = {}) {
    try {
      // Map collection names to Base44 entity types
      const entityMapping = {
        'messages': 'ChatMessage',
        'gigs': 'TutorListing',
        'requests': 'MarketplaceRequest',
        'users': 'PublicUserDirectory',
        'threads': 'Megathread',
        'news': 'NewsPost',
        'chats': 'SessionChat',
        'notifications': 'SessionNotification',
        'endorsements': 'StudentEndorsement',
        'replies': 'ThreadReply',
        'vouches': 'Vouch'
      };

      const entityType = entityMapping[collectionName] || collectionName;
      
      // Convert options to Base44 filters
      const filters = {};
      if (options.where && options.where.length > 0) {
        options.where.forEach(condition => {
          filters[condition.field] = condition.value;
        });
      }

      const entities = await base44Api.getEntities(entityType, filters);
      
      // Transform Base44 entities to our format
      return entities.map(entity => ({
        id: entity.id || Math.random().toString(36).substr(2, 9),
        ...entity
      }));
    } catch (error) {
      console.error('Find operation failed:', error);
      // Return empty array as fallback
      return [];
    }
  },

  async findOne(collectionName, field, value) {
    const results = await this.find(collectionName, { where: [{ field, operator: '==', value }] });
    return results.length > 0 ? results[0] : null;
  },

  async findById(collectionName, id) {
    try {
      const entityMapping = {
        'messages': 'ChatMessage',
        'gigs': 'TutorListing',
        'requests': 'MarketplaceRequest',
        'users': 'PublicUserDirectory',
        'threads': 'Megathread',
        'news': 'NewsPost',
        'chats': 'SessionChat',
        'notifications': 'SessionNotification',
        'endorsements': 'StudentEndorsement',
        'replies': 'ThreadReply',
        'vouches': 'Vouch'
      };

      const entityType = entityMapping[collectionName] || collectionName;
      const entity = await base44Api.request(`entities/${entityType}/${id}`);
      
      return {
        id: entity.id,
        ...entity
      };
    } catch (error) {
      console.error('FindById operation failed:', error);
      return null;
    }
  },

  async create(collectionName, data) {
    try {
      const entityMapping = {
        'messages': 'ChatMessage',
        'gigs': 'TutorListing',
        'requests': 'MarketplaceRequest',
        'users': 'PublicUserDirectory',
        'threads': 'Megathread',
        'news': 'NewsPost',
        'chats': 'SessionChat',
        'notifications': 'SessionNotification',
        'endorsements': 'StudentEndorsement',
        'replies': 'ThreadReply',
        'vouches': 'Vouch'
      };

      const entityType = entityMapping[collectionName] || collectionName;
      
      // Add timestamps
      const entityData = {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const entity = await base44Api.createEntity(entityType, entityData);
      
      return {
        id: entity.id || Math.random().toString(36).substr(2, 9),
        ...entityData
      };
    } catch (error) {
      console.error('Create operation failed:', error);
      throw error;
    }
  },

  async update(collectionName, id, data) {
    try {
      const entityMapping = {
        'messages': 'ChatMessage',
        'gigs': 'TutorListing',
        'requests': 'MarketplaceRequest',
        'users': 'PublicUserDirectory',
        'threads': 'Megathread',
        'news': 'NewsPost',
        'chats': 'SessionChat',
        'notifications': 'SessionNotification',
        'endorsements': 'StudentEndorsement',
        'replies': 'ThreadReply',
        'vouches': 'Vouch'
      };

      const entityType = entityMapping[collectionName] || collectionName;
      
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString()
      };

      await base44Api.updateEntity(entityType, id, updateData);
      
      return {
        id,
        ...updateData
      };
    } catch (error) {
      console.error('Update operation failed:', error);
      throw error;
    }
  },

  async delete(collectionName, id) {
    try {
      const entityMapping = {
        'messages': 'ChatMessage',
        'gigs': 'TutorListing',
        'requests': 'MarketplaceRequest',
        'users': 'PublicUserDirectory',
        'threads': 'Megathread',
        'news': 'NewsPost',
        'chats': 'SessionChat',
        'notifications': 'SessionNotification',
        'endorsements': 'StudentEndorsement',
        'replies': 'ThreadReply',
        'vouches': 'Vouch'
      };

      const entityType = entityMapping[collectionName] || collectionName;
      await base44Api.deleteEntity(entityType, id);
      return { success: true, id };
    } catch (error) {
      console.error('Delete operation failed:', error);
      throw error;
    }
  }
};

// Export Base44 configuration for direct API access
export { BASE44_CONFIG, base44Api };

// Export Firebase instances for direct use if needed
export { app, auth, db };

export default base44;