// API utilities for BigGrade
// Handles both Firebase operations and Base44 API calls through proxy

import { base44 } from '../firebaseClient';

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

// BigGrade API endpoints
export const api = {
  // User operations
  async createUser(userData) {
    try {
      return await base44.create('users', userData);
    } catch (error) {
      // Fallback to Base44 API if Firebase fails
      return await proxyRequest('users', {
        method: 'POST',
        data: userData
      });
    }
  },

  async getUser(userId) {
    try {
      return await base44.findById('users', userId);
    } catch (error) {
      return await proxyRequest(`users/${userId}`);
    }
  },

  async findUsers(filters = {}) {
    try {
      return await base44.find('users', filters);
    } catch (error) {
      const params = new URLSearchParams(filters);
      return await proxyRequest(`users?${params}`);
    }
  },

  // Gig operations
  async createGig(gigData) {
    try {
      return await base44.create('gigs', gigData);
    } catch (error) {
      return await proxyRequest('gigs', {
        method: 'POST',
        data: gigData
      });
    }
  },

  async getGigs(filters = {}) {
    try {
      return await base44.find('gigs', filters);
    } catch (error) {
      const params = new URLSearchParams(filters);
      return await proxyRequest(`gigs?${params}`);
    }
  },

  async getGig(gigId) {
    try {
      return await base44.findById('gigs', gigId);
    } catch (error) {
      return await proxyRequest(`gigs/${gigId}`);
    }
  },

  // Chat operations
  async createMessage(messageData) {
    try {
      return await base44.create('messages', messageData);
    } catch (error) {
      return await proxyRequest('messages', {
        method: 'POST',
        data: messageData
      });
    }
  },

  async getMessages(chatId) {
    try {
      return await base44.find('messages', {
        where: [{ field: 'chatId', operator: '==', value: chatId }],
        orderBy: 'createdAt'
      });
    } catch (error) {
      return await proxyRequest(`messages?chatId=${chatId}&orderBy=createdAt`);
    }
  },

  // Request operations
  async createRequest(requestData) {
    try {
      return await base44.create('requests', requestData);
    } catch (error) {
      return await proxyRequest('requests', {
        method: 'POST',
        data: requestData
      });
    }
  },

  async getRequests(filters = {}) {
    try {
      return await base44.find('requests', filters);
    } catch (error) {
      const params = new URLSearchParams(filters);
      return await proxyRequest(`requests?${params}`);
    }
  },

  // Leaderboard
  async getLeaderboard(limit = 10) {
    try {
      return await base44.find('users', {
        orderBy: 'rating',
        order: 'desc',
        limit
      });
    } catch (error) {
      return await proxyRequest(`leaderboard?limit=${limit}`);
    }
  },

  // Direct Base44 API access for complex operations
  async base44Request(endpoint, options = {}) {
    return await proxyRequest(endpoint, options);
  }
};

export default api;