// Utility functions to replace Base44 utils
import { base44 } from "./firebaseClient";

// Create page URL (simplified version)
export const createPageUrl = (page) => {
  // In a Firebase/React Router setup, this would typically just be the page name
  // or you might want to implement your own routing logic
  if (page.includes('?')) {
    const [pageName, queryParams] = page.split('?');
    return `/${pageName}?${queryParams}`;
  }
  return `/${page}`;
};

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Format time
export const formatTime = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleTimeString(undefined, options);
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Check if user is authenticated
export const isAuthenticated = () => {
  // This would need to be implemented properly with your auth system
  return true;
};

// Get current user
export const getCurrentUser = () => {
  // This would need to be implemented properly with your auth system
  return {
    uid: 'anonymous-user',
    email: 'anonymous@example.com',
    displayName: 'Anonymous User'
  };
};

// Safe function call (prevents "recorder is not defined" errors)
export const safeCall = (fn, ...args) => {
  try {
    if (typeof fn === 'function') {
      return fn(...args);
    }
  } catch (error) {
    console.warn('Safe call failed:', error);
    return null;
  }
};

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount || 0);
};

// Calculate time ago
export const timeAgo = (dateString) => {
  if (!dateString) return 'Never';
  
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return interval + " years ago";
  if (interval === 1) return "1 year ago";
  
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return interval + " months ago";
  if (interval === 1) return "1 month ago";
  
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return interval + " days ago";
  if (interval === 1) return "1 day ago";
  
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return interval + " hours ago";
  if (interval === 1) return "1 hour ago";
  
  interval = Math.floor(seconds / 60);
  if (interval > 1) return interval + " minutes ago";
  if (interval === 1) return "1 minute ago";
  
  return "Just now";
};

// Validate email
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Get user initials
export const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
};

// Safe JSON parse
export const safeJsonParse = (str, defaultValue = null) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    return defaultValue;
  }
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};