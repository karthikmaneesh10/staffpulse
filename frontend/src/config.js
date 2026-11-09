// API Base URL configuration for local dev and Render cloud deployment
export const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? '' 
    : 'https://staffpulse-backend.onrender.com');
