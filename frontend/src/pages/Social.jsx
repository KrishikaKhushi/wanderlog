import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api";

// Import components
import ProfileHeader from "../components/Profile/ProfileHeader";
import SocialSearch from "../components/Social/SocialSearch";
import UsersGrid from "../components/Social/UsersGrid";
import ImagePopup from "../components/Social/ImagePopup";

import "./Social.css";

const Social = () => {
  const { user } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [exploring, setExploring] = useState(new Set());
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Load all users on component mount
  useEffect(() => {
    console.log('Social page mounted, fetching users...');
    console.log('Current user:', user);
    
    setExploring(new Set());
    
    // Show mock data first for immediate display
    const mockUsers = [
      {
        _id: '1',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        bio: 'Adventure seeker and travel enthusiast 🌍',
        profilePicture: null,
        explorers: 0,
        exploring: 0,
        createdAt: new Date('2024-01-15')
      },
      {
        _id: '2',
        firstName: 'Sarah',
        lastName: 'Wilson',
        username: 'sarahw',
        bio: 'Digital nomad exploring the world one city at a time ✈️',
        profilePicture: null,
        explorers: 0,
        exploring: 0,
        createdAt: new Date('2024-02-20')
      }
    ];
    
    setUsers(mockUsers);
    setLoading(false);
    
    // Then try to fetch real data
    fetchUsers();
    loadExploringStatus();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users from API...');
      console.log('Current user:', user);
      console.log('API base URL:', API.defaults?.baseURL);
      
      setLoading(true);
      setError('');
      
      if (!user) {
        console.log('No user found, using mock data');
        throw new Error('User not authenticated');
      }
      
      const response = await API.get('/users/all');
      console.log('API Response:', response);
      
      if (response.data.success) {
        // DON'T filter out current user - include them in the list
        const allUsers = response.data.users.map(u => {
          // Cap the numbers at reasonable values
          const explorers = Math.min(u.explorers || 0, 3);
          const exploring = Math.min(u.exploring || 0, 3);
          
          return {
            ...u,
            explorers: explorers,
            exploring: exploring
          };
        });
        console.log('All users loaded from API (including current user):', allUsers.length);
        setUsers(allUsers);
        setError('');
      } else {
        throw new Error('API returned success: false');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      console.log('Error details:', error.response?.data);
      
      if (error.response?.status === 401) {
        setError('Authentication required');
      } else {
        setError('Failed to load users from server');
      }
      
      // Fallback to mock data (including current user)
      const mockUsers = [
        {
          _id: user?._id || 'current',
          firstName: user?.firstName || 'Current',
          lastName: user?.lastName || 'User',
          username: user?.username || 'currentuser',
          bio: 'This is your profile in the social feed',
          profilePicture: user?.profilePicture || null,
          explorers: 0,
          exploring: 0,
          createdAt: user?.createdAt || new Date()
        },
        {
          _id: '1',
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          bio: 'Adventure seeker and travel enthusiast 🌍',
          profilePicture: null,
          explorers: 0,
          exploring: 0,
          createdAt: new Date('2024-01-15')
        },
        {
          _id: '2',
          firstName: 'Sarah',
          lastName: 'Wilson',
          username: 'sarahw',
          bio: 'Digital nomad exploring the world one city at a time ✈️',
          profilePicture: null,
          explorers: 0,
          exploring: 0,
          createdAt: new Date('2024-02-20')
        },
        {
          _id: '3',
          firstName: 'Mike',
          lastName: 'Chen',
          username: 'mikechen',
          bio: 'Photographer capturing moments around the globe 📸',
          profilePicture: null,
          explorers: 0,
          exploring: 0,
          createdAt: new Date('2024-03-10')
        },
        {
          _id: '4',
          firstName: 'Emma',
          lastName: 'Rodriguez',
          username: 'emmarodriguez',
          bio: 'Food lover discovering culinary treasures worldwide 🍜',
          profilePicture: null,
          explorers: 0,
          exploring: 0,
          createdAt: new Date('2024-01-28')
        }
      ];
      console.log('Setting mock users (including current user):', mockUsers.length);
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const loadExploringStatus = async () => {
    try {
      console.log('🔍 Loading exploring status...');
      const response = await API.get('/users/exploring');
      console.log('🔍 Exploring response:', response.data);
      
      if (response.data.success) {
        const exploringIds = response.data.exploring.map(f => f._id);
        console.log('🔍 Currently exploring:', exploringIds);
        setExploring(new Set(exploringIds));
      }
    } catch (error) {
      console.error('❌ Error loading exploring status:', error);
      console.error('Error details:', error.response?.data);
      setExploring(new Set());
    }
  };

  const handleExplore = async (userId) => {
    try {
      const isExploring = exploring.has(userId);
      const endpoint = isExploring ? '/users/unexplore' : '/users/explore';
      
      console.log('🔍 Explore button clicked:', { userId, isExploring, endpoint });
      
      const response = await API.post(endpoint, { userId });
      console.log('✅ API Response:', response.data);
      
      if (response.data.success) {
        // Update local state immediately
        setExploring(prev => {
          const newSet = new Set(prev);
          if (isExploring) {
            newSet.delete(userId);
            console.log('➖ Removed from exploring:', userId);
          } else {
            newSet.add(userId);
            console.log('➕ Added to exploring:', userId);
          }
          console.log('🔄 New exploring set:', Array.from(newSet));
          return newSet;
        });

        // Update the user's explorer count in the UI immediately
        setUsers(prevUsers => 
          prevUsers.map(user => {
            if (user._id === userId) {
              const newCount = isExploring 
                ? Math.max(0, (user.explorers || 0) - 1)
                : (user.explorers || 0) + 1;
              console.log(`📊 Updated ${user.username} explorer count: ${user.explorers || 0} → ${newCount}`);
              return {
                ...user,
                explorers: newCount
              };
            }
            return user;
          })
        );
      }
    } catch (error) {
      console.error('❌ Error updating explore status:', error);
      console.error('Error details:', error.response?.data);
      
      // If API fails, still update UI temporarily
      setExploring(prev => {
        const newSet = new Set(prev);
        const isExploring = exploring.has(userId);
        if (isExploring) {
          newSet.delete(userId);
        } else {
          newSet.add(userId);
        }
        return newSet;
      });
    }
  };

  const handleAvatarClick = (userData) => {
    setSelectedUser(userData);
    setShowImagePopup(true);
  };

  const closeImagePopup = () => {
    setShowImagePopup(false);
    setSelectedUser(null);
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim().toLowerCase();
    const username = user.username?.toLowerCase() || '';
    const bio = user.bio?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    
    return displayName.includes(search) || 
           username.includes(search) || 
           bio.includes(search);
  });

  return (
    <div className="social-page">
      <ProfileHeader title="Social" />

      <div className="social-content">
        <SocialSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          usersCount={filteredUsers.length}
        />

        <UsersGrid
          users={filteredUsers}
          loading={loading}
          error={error}
          exploring={exploring}
          onExplore={handleExplore}
          onAvatarClick={handleAvatarClick}
          searchTerm={searchTerm}
        />
      </div>

      <ImagePopup
        isOpen={showImagePopup}
        user={selectedUser}
        onClose={closeImagePopup}
      />
    </div>
  );
};

export default Social;