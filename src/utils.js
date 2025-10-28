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
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Format time
export const formatTime = (dateString) => {
  const options = { hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleTimeString(undefined, options);
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Check if user is authenticated
export const isAuthenticated = () => {
  // This would need to be implemented properly
  return true;
};

// Get current user
export const getCurrentUser = () => {
  // This would need to be implemented properly
  return null;
};