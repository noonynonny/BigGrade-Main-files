// API utilities for BigGrade
// Handles both Firebase operations and Base44 API calls through proxy

import { base44, BASE44_CONFIG } from '../firebaseClient';

// Base API configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions/base44-proxy'
  : 'http://localhost:3001/base44';

// Helper function to make API calls through proxy
async function proxyRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}/${endpoint}`;
  
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  if (config.method !== 'GET' && options.data) {
    config.body = JSON.stringify(options.data);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Direct Base44 API calls (bypass proxy for production)
async function directBase44Request(endpoint, method = 'GET', data = null) {
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
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || `HTTP error! status: ${response.status}`);
    }
    
    return result;
  } catch (error) {
    console.error('Direct Base44 request failed:', error);
    throw error;
  }
}

// BigGrade API endpoints
export const api = {
  // User operations
  async createUser(userData) {
    try {
      return await base44.create('users', userData);
    } catch (error) {
      // Fallback to Base44 API
      return await directBase44Request('entities/PublicUserDirectory', 'POST', userData);
    }
  },

  async getUser(userId) {
    try {
      return await base44.findById('users', userId);
    } catch (error) {
      try {
        return await directBase44Request(`entities/PublicUserDirectory/${userId}`);
      } catch (fallbackError) {
        // Try to find by filtering
        const users = await directBase44Request('entities/PublicUserDirectory');
        return users.find(user => user.id === userId || user.uid === userId) || null;
      }
    }
  },

  async findUsers(filters = {}) {
    try {
      return await base44.find('users', filters);
    } catch (error) {
      // Convert filters to query params
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });
      const queryString = params.toString();
      const endpoint = queryString ? `entities/PublicUserDirectory?${queryString}` : 'entities/PublicUserDirectory';
      return await directBase44Request(endpoint);
    }
  },

  // Gig operations (TutorListing)
  async createGig(gigData) {
    try {
      return await base44.create('gigs', gigData);
    } catch (error) {
      return await directBase44Request('entities/TutorListing', 'POST', gigData);
    }
  },

  async getGigs(filters = {}) {
    try {
      return await base44.find('gigs', filters);
    } catch (error) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });
      const queryString = params.toString();
      const endpoint = queryString ? `entities/TutorListing?${queryString}` : 'entities/TutorListing';
      return await directBase44Request(endpoint);
    }
  },

  async getGig(gigId) {
    try {
      return await base44.findById('gigs', gigId);
    } catch (error) {
      try {
        return await directBase44Request(`entities/TutorListing/${gigId}`);
      } catch (fallbackError) {
        const gigs = await directBase44Request('entities/TutorListing');
        return gigs.find(gig => gig.id === gigId) || null;
      }
    }
  },

  // Chat operations (ChatMessage)
  async createMessage(messageData) {
    try {
      return await base44.create('messages', messageData);
    } catch (error) {
      return await directBase44Request('entities/ChatMessage', 'POST', messageData);
    }
  },

  async getMessages(chatId) {
    try {
      return await base44.find('messages', {
        where: [{ field: 'conversation_id', operator: '==', value: chatId }],
        orderBy: 'createdAt'
      });
    } catch (error) {
      const messages = await directBase44Request('entities/ChatMessage');
      return messages.filter(msg => msg.conversation_id === chatId);
    }
  },

  // Request operations (MarketplaceRequest)
  async createRequest(requestData) {
    try {
      return await base44.create('requests', requestData);
    } catch (error) {
      return await directBase44Request('entities/MarketplaceRequest', 'POST', requestData);
    }
  },

  async getRequests(filters = {}) {
    try {
      return await base44.find('requests', filters);
    } catch (error) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });
      const queryString = params.toString();
      const endpoint = queryString ? `entities/MarketplaceRequest?${queryString}` : 'entities/MarketplaceRequest';
      return await directBase44Request(endpoint);
    }
  },

  async getRequest(requestId) {
    try {
      return await base44.findById('requests', requestId);
    } catch (error) {
      try {
        return await directBase44Request(`entities/MarketplaceRequest/${requestId}`);
      } catch (fallbackError) {
        const requests = await directBase44Request('entities/MarketplaceRequest');
        return requests.find(req => req.id === requestId) || null;
      }
    }
  },

  // Thread operations (Megathread)
  async createThread(threadData) {
    try {
      return await base44.create('threads', threadData);
    } catch (error) {
      return await directBase44Request('entities/Megathread', 'POST', threadData);
    }
  },

  async getThreads(filters = {}) {
    try {
      return await base44.find('threads', filters);
    } catch (error) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });
      const queryString = params.toString();
      const endpoint = queryString ? `entities/Megathread?${queryString}` : 'entities/Megathread';
      return await directBase44Request(endpoint);
    }
  },

  // News operations (NewsPost)
  async getNews(filters = {}) {
    try {
      return await base44.find('news', filters);
    } catch (error) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });
      const queryString = params.toString();
      const endpoint = queryString ? `entities/NewsPost?${queryString}` : 'entities/NewsPost';
      return await directBase44Request(endpoint);
    }
  },

  // Leaderboard (based on PublicUserDirectory with ratings)
  async getLeaderboard(limit = 10) {
    try {
      return await base44.find('users', {
        orderBy: 'rating',
        order: 'desc',
        limit
      });
    } catch (error) {
      const users = await directBase44Request('entities/PublicUserDirectory');
      // Sort by rating if available
      return users
        .filter(user => user.rating !== undefined)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, limit);
    }
  },

  // Session operations (SessionChat)
  async createSession(sessionData) {
    try {
      return await base44.create('chats', sessionData);
    } catch (error) {
      return await directBase44Request('entities/SessionChat', 'POST', sessionData);
    }
  },

  async getSessions(filters = {}) {
    try {
      return await base44.find('chats', filters);
    } catch (error) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });
      const queryString = params.toString();
      const endpoint = queryString ? `entities/SessionChat?${queryString}` : 'entities/SessionChat';
      return await directBase44Request(endpoint);
    }
  },

  // Notification operations (SessionNotification)
  async createNotification(notificationData) {
    try {
      return await base44.create('notifications', notificationData);
    } catch (error) {
      return await directBase44Request('entities/SessionNotification', 'POST', notificationData);
    }
  },

  async getNotifications(filters = {}) {
    try {
      return await base44.find('notifications', filters);
    } catch (error) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });
      const queryString = params.toString();
      const endpoint = queryString ? `entities/SessionNotification?${queryString}` : 'entities/SessionNotification';
      return await directBase44Request(endpoint);
    }
  },

  // Direct Base44 API access for complex operations
  async base44Request(endpoint, options = {}) {
    return await directBase44Request(endpoint, options.method || 'GET', options.data);
  }
};

export default api;