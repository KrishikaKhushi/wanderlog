import { useState, useEffect } from 'react';
import API from '../../../api';

// Custom hook for user statistics
const useUserStats = (user) => {
  const [stats, setStats] = useState({ explorers: 0, exploring: 0 });
  const [explorersList, setExplorersList] = useState([]);
  const [exploringList, setExploringList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user statistics
  const fetchUserStats = async (username = user?.username) => {
    if (!username) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching user stats for:', username);
      
      const response = await API.get(`/users/${username}`);
      
      if (response.data.success) {
        const userData = response.data.user;
        
        const newStats = {
          explorers: userData.explorers || 0,
          exploring: userData.exploring || 0
        };
        
        console.log('📊 User stats:', newStats);
        setStats(newStats);
        
        return { success: true, data: userData, stats: newStats };
      } else {
        throw new Error('Failed to fetch user stats');
      }
    } catch (error) {
      console.error('❌ Error fetching user stats:', error);
      setError(error.message);
      setStats({ explorers: 0, exploring: 0 });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch explorers list (people who explore this user)
  const fetchExplorersList = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('👥 Fetching explorers list...');
      
      const response = await API.get('/users/explorers');
      
      if (response.data.success) {
        const explorers = response.data.explorers || [];
        setExplorersList(explorers);
        console.log('📊 Explorers list loaded:', explorers.length);
        return { success: true, data: explorers };
      } else {
        throw new Error('Failed to fetch explorers');
      }
    } catch (error) {
      console.error('❌ Error fetching explorers:', error);
      setError(error.message);
      setExplorersList([]);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch exploring list (people this user explores)
  const fetchExploringList = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('👥 Fetching exploring list...');
      
      const response = await API.get('/users/exploring');
      
      if (response.data.success) {
        const exploring = response.data.exploring || [];
        setExploringList(exploring);
        console.log('📊 Exploring list loaded:', exploring.length);
        return { success: true, data: exploring };
      } else {
        throw new Error('Failed to fetch exploring list');
      }
    } catch (error) {
      console.error('❌ Error fetching exploring list:', error);
      setError(error.message);
      setExploringList([]);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Explore a user
  const exploreUser = async (userId) => {
    try {
      console.log('👥 Exploring user:', userId);
      
      const response = await API.post('/users/explore', { userId });
      
      if (response.data.success) {
        console.log('✅ Successfully exploring user');
        
        // Update local stats
        setStats(prev => ({ 
          ...prev, 
          exploring: prev.exploring + 1 
        }));
        
        return { success: true };
      } else {
        throw new Error('Failed to explore user');
      }
    } catch (error) {
      console.error('❌ Error exploring user:', error);
      return { success: false, error: error.message };
    }
  };

  // Stop exploring a user
  const unexploreUser = async (userId) => {
    try {
      console.log('👥 Stopping exploration of user:', userId);
      
      const response = await API.post('/users/unexplore', { userId });
      
      if (response.data.success) {
        console.log('✅ Successfully stopped exploring user');
        
        // Update local stats
        setStats(prev => ({ 
          ...prev, 
          exploring: Math.max(0, prev.exploring - 1)
        }));
        
        return { success: true };
      } else {
        throw new Error('Failed to stop exploring user');
      }
    } catch (error) {
      console.error('❌ Error stopping exploration:', error);
      return { success: false, error: error.message };
    }
  };

  // Refresh all data
  const refreshAll = async () => {
    await Promise.all([
      fetchUserStats(),
      fetchExplorersList(),
      fetchExploringList()
    ]);
  };

  // Auto-fetch stats when user changes
  useEffect(() => {
    if (user?.username) {
      fetchUserStats();
    }
  }, [user?.username]);

  // Auto-refresh on window focus (when user returns from another tab)
  useEffect(() => {
    const handleFocus = () => {
      if (user?.username) {
        fetchUserStats();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user?.username]);

  return {
    stats,
    explorersList,
    exploringList,
    loading,
    error,
    fetchUserStats,
    fetchExplorersList,
    fetchExploringList,
    exploreUser,
    unexploreUser,
    refreshAll
  };
};

export default useUserStats;
export { useUserStats };