// src/api.js
import axios from 'axios';

// Determine API URL based on environment
const getApiUrl = () => {
  // Check if we're in development or production
  if (import.meta.env.DEV) {
    // Development - use local backend
    return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  } else {
    // Production - use deployed backend
    return import.meta.env.VITE_API_URL_PROD || 'https://wanderlog-backend-g8te.onrender.com/api';
  }
};

console.log('🔗 API URL:', getApiUrl());
console.log('🌍 Environment:', import.meta.env.MODE);

const API = axios.create({
  baseURL: getApiUrl(),
  timeout: 10000, // 10 second timeout
  withCredentials: true, // Important for cookies/sessions
});

// Request interceptor for debugging
API.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

export default API;