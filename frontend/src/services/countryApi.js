// src/services/countryApi.js
import API from '../api';

// Photo API calls
export const photoApi = {
  // Get photos for a specific country
  getPhotosForCountry: async (countryCode) => {
    try {
      const response = await API.get(`/photos/country/${countryCode}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching photos:', error);
      throw error;
    }
  },

  // Upload photos as base64
  uploadPhotosBase64: async (photos, country, countryCode) => {
    try {
      const response = await API.post('/photos/upload-base64', {
        photos,
        country,
        countryCode
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading photos:', error);
      throw error;
    }
  },

  // Upload photos as files
  uploadPhotosFile: async (files, country, countryCode, additionalData = {}) => {
    try {
      const formData = new FormData();
      
      // Add files
      files.forEach(file => {
        formData.append('photos', file);
      });
      
      // Add metadata
      formData.append('country', country);
      formData.append('countryCode', countryCode);
      
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });

      const response = await API.post('/photos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading photos:', error);
      throw error;
    }
  },

  // Update photo
  updatePhoto: async (photoId, updates) => {
    try {
      const response = await API.put(`/photos/${photoId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating photo:', error);
      throw error;
    }
  },

  // Delete photo
  deletePhoto: async (photoId) => {
    try {
      const response = await API.delete(`/photos/${photoId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  },

  // Like/unlike photo
  togglePhotoLike: async (photoId) => {
    try {
      const response = await API.post(`/photos/${photoId}/like`);
      return response.data;
    } catch (error) {
      console.error('Error toggling photo like:', error);
      throw error;
    }
  },

  // Get public photos for a country
  getPublicPhotos: async (countryCode, limit = 50) => {
    try {
      const response = await API.get(`/photos/country/${countryCode}/public?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching public photos:', error);
      throw error;
    }
  },

  // Get user photo statistics
  getPhotoStats: async () => {
    try {
      const response = await API.get('/photos/user/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching photo stats:', error);
      throw error;
    }
  }
};

// Journal API calls
export const journalApi = {
  // Get journal entries for a specific country
  getEntriesForCountry: async (countryCode) => {
    try {
      const response = await API.get(`/journal/country/${countryCode}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      throw error;
    }
  },

  // Create a new journal entry
  createEntry: async (entryData) => {
    try {
      const response = await API.post('/journal', entryData);
      return response.data;
    } catch (error) {
      console.error('Error creating journal entry:', error);
      throw error;
    }
  },

  // Get a specific journal entry
  getEntry: async (entryId) => {
    try {
      const response = await API.get(`/journal/${entryId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching journal entry:', error);
      throw error;
    }
  },

  // Update a journal entry
  updateEntry: async (entryId, updates) => {
    try {
      const response = await API.put(`/journal/${entryId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating journal entry:', error);
      throw error;
    }
  },

  // Delete a journal entry
  deleteEntry: async (entryId) => {
    try {
      const response = await API.delete(`/journal/${entryId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      throw error;
    }
  },

  // Like/unlike journal entry
  toggleEntryLike: async (entryId) => {
    try {
      const response = await API.post(`/journal/${entryId}/like`);
      return response.data;
    } catch (error) {
      console.error('Error toggling entry like:', error);
      throw error;
    }
  },

  // Add comment to journal entry
  addComment: async (entryId, text) => {
    try {
      const response = await API.post(`/journal/${entryId}/comment`, { text });
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // Get public journal entries for a country
  getPublicEntries: async (countryCode, limit = 20) => {
    try {
      const response = await API.get(`/journal/country/${countryCode}/public?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching public entries:', error);
      throw error;
    }
  },

  // Search journal entries
  searchEntries: async (query, filters = {}) => {
    try {
      const params = new URLSearchParams({
        q: query,
        ...filters
      });
      const response = await API.get(`/journal/search?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error searching journal entries:', error);
      throw error;
    }
  },

  // Get user journal statistics
  getJournalStats: async () => {
    try {
      const response = await API.get('/journal/user/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching journal stats:', error);
      throw error;
    }
  }
};

// Country data API calls
export const countryApi = {
  // Get country-specific pin data
  getCountryPin: async (countryCode) => {
    try {
      const response = await API.get('/pins');
      const pins = response.data;
      
      // Find pin for this country
      const countryPin = pins.find(pin => 
        pin.country.toLowerCase() === decodeURIComponent(countryCode).toLowerCase()
      );
      
      return { success: true, pin: countryPin };
    } catch (error) {
      console.error('Error fetching country pin:', error);
      throw error;
    }
  },

  // Create or update country pin
  createOrUpdatePin: async (countryData) => {
    try {
      const response = await API.post('/pins', countryData);
      return response.data;
    } catch (error) {
      console.error('Error creating/updating pin:', error);
      throw error;
    }
  },

  // Get comprehensive country data (pins + photos + journal)
  getCountryData: async (countryCode) => {
    try {
      const [pinResponse, photosResponse, journalResponse] = await Promise.all([
        countryApi.getCountryPin(countryCode),
        photoApi.getPhotosForCountry(countryCode),
        journalApi.getEntriesForCountry(countryCode)
      ]);

      return {
        success: true,
        data: {
          pin: pinResponse.pin,
          photos: photosResponse.photos || [],
          journal: journalResponse.entries || [],
          stats: {
            photoCount: photosResponse.total || 0,
            journalCount: journalResponse.total || 0
          }
        }
      };
    } catch (error) {
      console.error('Error fetching comprehensive country data:', error);
      throw error;
    }
  },

  // Get public country data for exploration
  getPublicCountryData: async (countryCode) => {
    try {
      const [photosResponse, journalResponse] = await Promise.all([
        photoApi.getPublicPhotos(countryCode),
        journalApi.getPublicEntries(countryCode)
      ]);

      return {
        success: true,
        data: {
          photos: photosResponse.photos || [],
          journal: journalResponse.entries || [],
          stats: {
            photoCount: photosResponse.total || 0,
            journalCount: journalResponse.total || 0
          }
        }
      };
    } catch (error) {
      console.error('Error fetching public country data:', error);
      throw error;
    }
  }
};

// Utility functions
export const utils = {
  // Convert file to base64
  fileToBase64: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  },

  // Convert multiple files to base64
  filesToBase64: async (files) => {
    const base64Files = [];
    for (const file of files) {
      try {
        const base64 = await utils.fileToBase64(file);
        base64Files.push({
          base64,
          filename: file.name,
          size: file.size,
          type: file.type
        });
      } catch (error) {
        console.error('Error converting file to base64:', error);
      }
    }
    return base64Files;
  },

  // Get country code from country name
  getCountryCode: (countryName) => {
    // This is a simplified mapping - you might want to use a proper country code library
    const countryCodeMap = {
      'United States': 'US',
      'United Kingdom': 'GB',
      'Canada': 'CA',
      'France': 'FR',
      'Germany': 'DE',
      'Italy': 'IT',
      'Spain': 'ES',
      'Japan': 'JP',
      'China': 'CN',
      'India': 'IN',
      'Australia': 'AU',
      'Brazil': 'BR',
      'Mexico': 'MX',
      'Russia': 'RU',
      'South Korea': 'KR',
      'Netherlands': 'NL',
      'Sweden': 'SE',
      'Norway': 'NO',
      'Denmark': 'DK',
      'Finland': 'FI',
      // Add more as needed
    };
    
    return countryCodeMap[countryName] || countryName.substring(0, 2).toUpperCase();
  },

  // Format date for display
  formatDate: (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

// Export everything as default
export default {
  photoApi,
  journalApi,
  countryApi,
  utils
};