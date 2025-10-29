// Base44 Client Configuration
// Complete implementation with authentication and entity management

const BASE44_CONFIG = {
  apiUrl: 'https://app.base44.com/api/apps/68f3aa9b3f0b7e0b3370d6fc',
  apiKey: '25a08cae07624f7b977e48d02f684891',
  appId: '68f3aa9b3f0b7e0b3370d6fc'
};

// Base44 API helper functions
const base44Api = {
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
        const errorText = await response.text();
        console.error(`API Error ${response.status}:`, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Base44 API error:', error);
      throw error;
    }
  },

  async getEntities(entityType, filters = {}) {
    let url = `entities/${entityType}`;
    const params = new URLSearchParams(filters);
    if (params.toString()) {
      url += '?' + params.toString();
    }
    return this.request(url);
  },

  async getEntity(entityType, entityId) {
    return this.request(`entities/${entityType}/${entityId}`);
  },

  async createEntity(entityType, data) {
    return this.request(`entities/${entityType}`, 'POST', data);
  },

  async updateEntity(entityType, entityId, data) {
    return this.request(`entities/${entityType}/${entityId}`, 'PUT', data);
  },

  async deleteEntity(entityType, entityId) {
    return this.request(`entities/${entityType}/${entityId}`, 'DELETE');
  }
};

// Entity type mapping
const entityMapping = {
  'messages': 'ChatMessage',
  'globalMessages': 'GlobalChatMessage',
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

// Authentication manager
const auth = {
  currentUser: null,
  
  getCurrentUser() {
    if (this.currentUser) return this.currentUser;
    
    const stored = localStorage.getItem('biggrade_user');
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored);
        return this.currentUser;
      } catch (e) {
        localStorage.removeItem('biggrade_user');
      }
    }
    return null;
  },
  
  setCurrentUser(user) {
    this.currentUser = user;
    localStorage.setItem('biggrade_user', JSON.stringify(user));
  },
  
  async signIn(email, displayName, userType = 'student') {
    try {
      const userId = 'user_' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
      
      const authUser = {
        uid: userId,
        email: email,
        displayName: displayName || email.split('@')[0],
        photoURL: null,
        userType: userType // 'student' or 'tutor'
      };
      
      this.setCurrentUser(authUser);
      return authUser;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },
  
  signOut() {
    this.currentUser = null;
    localStorage.removeItem('biggrade_user');
  }
};

// Entity class for Base44-like API
class EntityCollection {
  constructor(entityType) {
    this.entityType = entityType;
    this.subscribers = new Map();
  }

  async filter(filters = {}, sortField = null, limitCount = null) {
    try {
      const entities = await base44Api.getEntities(this.entityType, filters);
      let results = Array.isArray(entities) ? entities : [];
      
      // Sort if specified
      if (sortField) {
        const isDescending = sortField.startsWith('-');
        const field = isDescending ? sortField.substring(1) : sortField;
        results.sort((a, b) => {
          const aVal = a[field];
          const bVal = b[field];
          const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
          return isDescending ? -comparison : comparison;
        });
      }
      
      // Limit if specified
      if (limitCount) {
        results = results.slice(0, limitCount);
      }
      
      return results;
    } catch (error) {
      console.error(`Error filtering ${this.entityType}:`, error);
      return [];
    }
  }

  async get(entityId) {
    try {
      return await base44Api.getEntity(this.entityType, entityId);
    } catch (error) {
      console.error(`Error getting ${this.entityType}:`, error);
      return null;
    }
  }

  async create(data) {
    try {
      const entityData = {
        ...data,
        created_date: data.created_date || new Date().toISOString(),
        updated_date: new Date().toISOString()
      };
      return await base44Api.createEntity(this.entityType, entityData);
    } catch (error) {
      console.error(`Error creating ${this.entityType}:`, error);
      throw error;
    }
  }

  async update(entityId, data) {
    try {
      const updateData = {
        ...data,
        updated_date: new Date().toISOString()
      };
      return await base44Api.updateEntity(this.entityType, entityId, updateData);
    } catch (error) {
      console.error(`Error updating ${this.entityType}:`, error);
      throw error;
    }
  }

  async delete(entityId) {
    try {
      return await base44Api.deleteEntity(this.entityType, entityId);
    } catch (error) {
      console.error(`Error deleting ${this.entityType}:`, error);
      throw error;
    }
  }

  // Simulate real-time subscription with polling
  subscribe(filters, callback, pollInterval = 5000) {
    const subscriptionId = Math.random().toString(36).substring(7);
    let isActive = true;
    
    const poll = async () => {
      if (!isActive) return;
      
      try {
        const results = await this.filter(filters);
        if (isActive) {
          callback(results);
        }
      } catch (error) {
        console.error(`Subscription error for ${this.entityType}:`, error);
      }
      
      if (isActive) {
        setTimeout(poll, pollInterval);
      }
    };
    
    // Initial fetch
    poll();
    
    // Return unsubscribe function
    return () => {
      isActive = false;
      this.subscribers.delete(subscriptionId);
    };
  }
}

// Main base44 export with all entity collections
export const base44 = {
  // Authentication
  auth() {
    return auth.getCurrentUser();
  },
  
  signIn(email, displayName, userType) {
    return auth.signIn(email, displayName, userType);
  },
  
  signOut() {
    auth.signOut();
  },

  // Entity collections (Base44-like API)
  ChatMessage: new EntityCollection('ChatMessage'),
  GlobalChatMessage: new EntityCollection('GlobalChatMessage'),
  TutorListing: new EntityCollection('TutorListing'),
  MarketplaceRequest: new EntityCollection('MarketplaceRequest'),
  PublicUserDirectory: new EntityCollection('PublicUserDirectory'),
  Megathread: new EntityCollection('Megathread'),
  NewsPost: new EntityCollection('NewsPost'),
  SessionChat: new EntityCollection('SessionChat'),
  SessionNotification: new EntityCollection('SessionNotification'),
  StudentEndorsement: new EntityCollection('StudentEndorsement'),
  ThreadReply: new EntityCollection('ThreadReply'),
  Vouch: new EntityCollection('Vouch'),

  // Legacy database operations for compatibility
  async find(collectionName, options = {}) {
    const entityType = entityMapping[collectionName] || collectionName;
    const collection = new EntityCollection(entityType);
    return collection.filter(options.where ? options.where[0] : {});
  },

  async findOne(collectionName, field, value) {
    const results = await this.find(collectionName, { where: [{ field, value }] });
    return results.length > 0 ? results[0] : null;
  },

  async findById(collectionName, id) {
    const entityType = entityMapping[collectionName] || collectionName;
    const collection = new EntityCollection(entityType);
    return collection.get(id);
  },

  async create(collectionName, data) {
    const entityType = entityMapping[collectionName] || collectionName;
    const collection = new EntityCollection(entityType);
    return collection.create(data);
  },

  async update(collectionName, id, data) {
    const entityType = entityMapping[collectionName] || collectionName;
    const collection = new EntityCollection(entityType);
    return collection.update(id, data);
  },

  async delete(collectionName, id) {
    const entityType = entityMapping[collectionName] || collectionName;
    const collection = new EntityCollection(entityType);
    return collection.delete(id);
  }
};

// Export configuration
export { BASE44_CONFIG, base44Api };

export default base44;
