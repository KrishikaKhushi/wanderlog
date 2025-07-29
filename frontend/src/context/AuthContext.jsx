import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Configure API with token
  useEffect(() => {
    if (token) {
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete API.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          setToken(storedToken);
          const response = await API.get('/auth/me');
          setUser(response.data.user);
          console.log('✅ User authenticated:', response.data.user.username);
        } catch (error) {
          console.error('❌ Auth check failed:', error);
          // Invalid token, remove it
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login for:', email);
      const response = await API.post('/auth/login', { email, password });
      
      const { token: newToken, user: userData } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      console.log('✅ Login successful:', userData.username);
      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ Login failed:', error);
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 Attempting registration for:', userData.email);
      const response = await API.post('/auth/register', userData);
      
      const { token: newToken, user: newUser } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      
      console.log('✅ Registration successful:', newUser.username);
      return { success: true, user: newUser };
    } catch (error) {
      console.error('❌ Registration failed:', error);
      const message = error.response?.data?.message || 'Registration failed';
      const errors = error.response?.data?.errors || [];
      return { success: false, message, errors };
    }
  };

  // NEW: Google OAuth login
  const googleLogin = async (credential) => {
    try {
      console.log('🔐 Attempting Google login');
      const response = await API.post('/auth/google', { credential });
      
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        
        // Store token and user data
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        
        console.log('✅ Google login successful:', userData.username);
        return { success: true, user: userData };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('❌ Google login failed:', error);
      const message = error.response?.data?.message || 'Google login failed';
      return { success: false, message };
    }
  };

  const logout = () => {
    console.log('👋 Logging out user:', user?.username);
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete API.defaults.headers.common['Authorization'];
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  // NEW: Update user preferences
  const updateUserPreferences = async (preferences) => {
    try {
      console.log('⚙️ Updating user preferences:', preferences);
      
      const response = await API.put('/auth/preferences', { preferences });
      
      if (response.data.success) {
        const updatedUser = { ...user, preferences: response.data.preferences };
        setUser(updatedUser);
        console.log('✅ Preferences updated successfully');
        return { success: true };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('❌ Preferences update error:', error);
      const message = error.response?.data?.message || 'Failed to update preferences';
      return { success: false, message };
    }
  };

  // NEW: Check if user can use password login (not Google-only account)
  const canUsePasswordLogin = () => {
    return user && !user.googleId;
  };

  // NEW: Check if user is Google OAuth user
  const isGoogleUser = () => {
    return user && !!user.googleId;
  };

  // NEW: Refresh user data
  const refreshUser = async () => {
    try {
      const response = await API.get('/auth/me');
      setUser(response.data.user);
      console.log('✅ User data refreshed');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to refresh user data:', error);
      return { success: false, message: 'Failed to refresh user data' };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    googleLogin, // NEW
    logout,
    updateUser,
    updateUserPreferences, // NEW
    canUsePasswordLogin, // NEW
    isGoogleUser, // NEW
    refreshUser, // NEW
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};