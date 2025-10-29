// Base44 Client Configuration
// Direct connection to Base44 API without Firebase

const BASE44_CONFIG = {
  apiUrl: 'https://app.base44.com/api/apps/68f3aa9b3f0b7e0b3370d6fc',
  apiKey: '25a08cae07624f7b977e48d02f684891',
  appId: '68f3aa9b3f0b7e0b3370d6fc'
};

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

  // Get single entity
  async getEntity(entityType, entityId) {
    return this.request(`entities/${entityType}/${entityId}`);
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

// Simple authentication using localStorage
const auth = {
  currentUser: null,
  
  // Get current user from localStorage
  getCurrentUser() {
    if (this.currentUser) return this.currentUser;
    
    const stored = localStorage.getItem('biggrade_user');
    if (stored) {
      this.currentUser = JSON.parse(stored);
      return this.currentUser;
    }
    return null;
  },
  
  // Set current user
  setCurrentUser(user) {
    this.currentUser = user;
    localStorage.setItem('biggrade_user', JSON.stringify(user));
  },
  
  // Sign in (create simple local user)
  async signIn(email, displayName) {
    try {
      // Create a simple user object without API call
      // The user will be created in Base44 when they perform actions
      const userId = 'user_' + btoa(email).replace(/=/g, '').substring(0, 16);
      
      const authUser = {
        uid: userId,
        email: email,
        displayName: displayName || email.split('@')[0],
        photoURL: null
      };
      
      this.setCurrentUser(authUser);
      return authUser;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },
  
  // Sign out
  signOut() {
    this.currentUser = null;
    localStorage.removeItem('biggrade_user');
  }
};

// Base44 database operations
export const base44 = {
  // Authentication
  auth() {
    return auth.getCurrentUser();
  },
  
  signIn(email, displayName) {
    return auth.signIn(email, displayName);
  },
  
  signOut() {
    auth.signOut();
  },

  // Database operations
  async find(collectionName, options = {}) {
    try {
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
      return Array.isArray(entities) ? entities.map(entity => ({
        id: entity.id,
        ...entity
      })) : [];
    } catch (error) {
      console.error('Find operation failed:', error);
      return [];
    }
  },

  async findOne(collectionName, field, value) {
    const results = await this.find(collectionName, { where: [{ field, operator: '==', value }] });
    return results.length > 0 ? results[0] : null;
  },

  async findById(collectionName, id) {
    try {
      const entityType = entityMapping[collectionName] || collectionName;
      const entity = await base44Api.getEntity(entityType, id);
      
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
      const entityType = entityMapping[collectionName] || collectionName;
      
      // Add timestamps
      const entityData = {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const entity = await base44Api.createEntity(entityType, entityData);
      
      return {
        id: entity.id,
        ...entity
      };
    } catch (error) {
      console.error('Create operation failed:', error);
      throw error;
    }
  },

  async update(collectionName, id, data) {
    try {
      const entityType = entityMapping[collectionName] || collectionName;
      
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString()
      };

      const entity = await base44Api.updateEntity(entityType, id, updateData);
      
      return {
        id: entity.id || id,
        ...entity
      };
    } catch (error) {
      console.error('Update operation failed:', error);
      throw error;
    }
  },

  async delete(collectionName, id) {
    try {
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

export default base44;
