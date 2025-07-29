import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./CountryPage.css";
import GallerySection from "../components/GallerySection";
import JournalSection from "../components/JournalSection";
import { countryApi, photoApi, journalApi, utils } from "../services/countryApi";

const CountryPage = () => {
  const { countryCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // UI State
  const [activeTab, setActiveTab] = useState("gallery");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Journal State
  const [entry, setEntry] = useState("");
  const [entries, setEntries] = useState([]);
  
  // Photo State
  const [photos, setPhotos] = useState([]);
  const [galleryView, setGalleryView] = useState("slideshow");
  
  // Country Data State
  const [countryData, setCountryData] = useState({
    pin: null,
    stats: { photoCount: 0, journalCount: 0 }
  });

  const countryName = decodeURIComponent(countryCode).replace(/\b\w/g, (l) => l.toUpperCase());

  // Load country data on component mount
  useEffect(() => {
    loadCountryData();
  }, [countryCode]);

  const loadCountryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📍 Loading country data for:', countryName);
      
      // Get country code for API calls
      const apiCountryCode = utils.getCountryCode(countryName);
      
      // Load comprehensive country data
      const response = await countryApi.getCountryData(apiCountryCode);
      
      if (response.success) {
        const { pin, photos: loadedPhotos, journal: loadedEntries, stats } = response.data;
        
        // Set country data
        setCountryData({ pin, stats });
        
        // Convert photos for display
        const displayPhotos = loadedPhotos.map(photo => ({
          id: photo._id,
          url: photo.url,
          caption: photo.caption,
          tags: photo.tags,
          uploadedAt: photo.uploadedAt,
          isPublic: photo.isPublic,
          likes: photo.likes || [],
          views: photo.views || 0
        }));
        setPhotos(displayPhotos);
        
        // Convert journal entries for display
        const displayEntries = loadedEntries.map(journalEntry => ({
          id: journalEntry._id,
          text: journalEntry.content,
          title: journalEntry.title,
          date: journalEntry.createdAt,
          mood: journalEntry.mood,
          weather: journalEntry.weather,
          tags: journalEntry.tags,
          isPublic: journalEntry.isPublic,
          isFavorite: journalEntry.isFavorite,
          likes: journalEntry.likes || [],
          wordCount: journalEntry.wordCount,
          readingTime: journalEntry.readingTime
        }));
        setEntries(displayEntries);
        
        console.log('✅ Country data loaded successfully:', {
          photos: displayPhotos.length,
          entries: displayEntries.length
        });
      }
    } catch (error) {
      console.error('❌ Error loading country data:', error);
      setError('Failed to load country data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateBack = () => {
    navigate("/");
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Journal Functions
  const handleEntrySubmit = async (e) => {
    e.preventDefault();
    
    if (!entry.trim()) return;
    
    try {
      console.log('📖 Creating new journal entry');
      
      const apiCountryCode = utils.getCountryCode(countryName);
      
      const entryData = {
        country: countryName,
        countryCode: apiCountryCode,
        content: entry.trim(),
        title: '', // Can be added later
        mood: 'content', // Default mood
        isPublic: false, // Default to private
        isFavorite: false
      };
      
      const response = await journalApi.createEntry(entryData);
      
      if (response.success) {
        const newEntry = {
          id: response.entry._id,
          text: response.entry.content,
          title: response.entry.title,
          date: response.entry.createdAt,
          mood: response.entry.mood,
          weather: response.entry.weather,
          tags: response.entry.tags,
          isPublic: response.entry.isPublic,
          isFavorite: response.entry.isFavorite,
          likes: response.entry.likes || [],
          wordCount: response.entry.wordCount,
          readingTime: response.entry.readingTime
        };
        
        setEntries(prev => [newEntry, ...prev]);
        setEntry("");
        
        // Update stats
        setCountryData(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            journalCount: prev.stats.journalCount + 1
          }
        }));
        
        console.log('✅ Journal entry created successfully');
      }
    } catch (error) {
      console.error('❌ Error creating journal entry:', error);
      setError('Failed to save journal entry. Please try again.');
    }
  };

  const handleUpdateEntry = async (entryId, updatedText) => {
    try {
      console.log('📝 Updating journal entry:', entryId);
      
      const response = await journalApi.updateEntry(entryId, {
        content: updatedText.trim()
      });
      
      if (response.success) {
        setEntries(prev => prev.map(entry => 
          entry.id === entryId 
            ? { ...entry, text: response.entry.content, wordCount: response.entry.wordCount }
            : entry
        ));
        
        console.log('✅ Journal entry updated successfully');
      }
    } catch (error) {
      console.error('❌ Error updating journal entry:', error);
      setError('Failed to update journal entry. Please try again.');
    }
  };

  const handleDeleteEntry = async (entryId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this entry?");
    if (!confirmDelete) return;
    
    try {
      console.log('🗑️ Deleting journal entry:', entryId);
      
      const response = await journalApi.deleteEntry(entryId);
      
      if (response.success) {
        setEntries(prev => prev.filter(entry => entry.id !== entryId));
        
        // Update stats
        setCountryData(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            journalCount: Math.max(0, prev.stats.journalCount - 1)
          }
        }));
        
        console.log('✅ Journal entry deleted successfully');
      }
    } catch (error) {
      console.error('❌ Error deleting journal entry:', error);
      setError('Failed to delete journal entry. Please try again.');
    }
  };

  // Photo Functions
  const handlePhotoUpload = async (e) => {
    // Check if this is a direct backend photo update from UploadOrganizer
    if (e.backendPhotos) {
      setPhotos(prev => [...e.backendPhotos, ...prev]);
      
      // Update stats
      setCountryData(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          photoCount: prev.stats.photoCount + e.backendPhotos.length
        }
      }));
      
      console.log('✅ Photos updated from UploadOrganizer backend:', e.backendPhotos.length);
      return;
    }
    
    // Original direct file upload logic
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    try {
      console.log('📸 Direct uploading photos:', files.length);
      
      // Convert files to base64 for easier handling
      const base64Files = await utils.filesToBase64(files);
      const apiCountryCode = utils.getCountryCode(countryName);
      
      const photosData = base64Files.map(file => ({
        base64: file.base64,
        filename: file.filename,
        caption: '',
        tags: [],
        isPublic: false
      }));
      
      const response = await photoApi.uploadPhotosBase64(photosData, countryName, apiCountryCode);
      
      if (response.success) {
        // Convert uploaded photos for display
        const newPhotos = response.photos.map(photo => ({
          id: photo._id,
          url: photo.url,
          caption: photo.caption,
          tags: photo.tags,
          uploadedAt: photo.uploadedAt,
          isPublic: photo.isPublic,
          likes: photo.likes || [],
          views: photo.views || 0
        }));
        
        setPhotos(prev => [...newPhotos, ...prev]);
        
        // Update stats
        setCountryData(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            photoCount: prev.stats.photoCount + newPhotos.length
          }
        }));
        
        console.log('✅ Direct photos uploaded successfully:', newPhotos.length);
      }
    } catch (error) {
      console.error('❌ Error uploading photos:', error);
      setError('Failed to upload photos. Please try again.');
    }
  };

  // Add this new function for refreshing data after uploads
  const handlePhotoRefresh = () => {
    loadCountryData();
    console.log('🔄 Refreshing country data after photo upload');
  };

  const handleDeletePhoto = async (photoId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this photo?");
    if (!confirmDelete) return;
    
    try {
      console.log('🗑️ Deleting photo:', photoId);
      
      const response = await photoApi.deletePhoto(photoId);
      
      if (response.success) {
        setPhotos(prev => prev.filter(photo => photo.id !== photoId));
        
        // Update stats
        setCountryData(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            photoCount: Math.max(0, prev.stats.photoCount - 1)
          }
        }));
        
        console.log('✅ Photo deleted successfully');
      }
    } catch (error) {
      console.error('❌ Error deleting photo:', error);
      setError('Failed to delete photo. Please try again.');
    }
  };

  // Enhanced entry functions for compatibility with JournalSection
  const handleEntryUpdate = (index, updatedText) => {
    const entryToUpdate = entries[index];
    if (entryToUpdate) {
      handleUpdateEntry(entryToUpdate.id, updatedText);
    }
  };

  const handleEntryDelete = (index) => {
    const entryToDelete = entries[index];
    if (entryToDelete) {
      handleDeleteEntry(entryToDelete.id);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="country-page">
        <div className="country-header">
          <button className="back-button" onClick={handleNavigateBack}>
            ←
          </button>
          <h1>Loading {countryName}...</h1>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          color: '#2B509E',
          fontSize: '1.2rem'
        }}>
          🌍 Loading your journey data...
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="country-page">
        <div className="country-header">
          <button className="back-button" onClick={handleNavigateBack}>
            ←
          </button>
          <h1>Error Loading {countryName}</h1>
        </div>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          color: '#ff6b6b',
          fontSize: '1.1rem',
          textAlign: 'center'
        }}>
          <div>❌ {error}</div>
          <button 
            onClick={loadCountryData}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#2B509E',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="country-page">
      <div className="country-header">
        <button className="back-button" onClick={handleNavigateBack}>
          ←
        </button>
        <h1>My Journey in {countryName}</h1>
      </div>

      {/* Stats Display */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '2rem', 
        marginBottom: '1rem',
        color: '#2B509E',
        fontSize: '0.9rem'
      }}>
        <span>📸 {countryData.stats.photoCount} Photos</span>
        <span>📖 {countryData.stats.journalCount} Entries</span>
        {countryData.pin && (
          <span>📍 {countryData.pin.type === 'visited' ? 'Visited' : 'Dream Destination'}</span>
        )}
      </div>

      {/* Three Toggle Buttons */}
      <div className="toggle-buttons">
        <button
          onClick={() => handleTabChange("gallery")}
          className={activeTab === "gallery" ? "active" : ""}
        >
          Gallery
        </button>
        <button
          onClick={() => handleTabChange("journal")}
          className={activeTab === "journal" ? "active" : ""}
        >
          Journal
        </button>
        <button
          onClick={() => handleTabChange("album")}
          className={activeTab === "album" ? "active" : ""}
        >
          Album
        </button>
      </div>

      <div className="main-content">
        {activeTab === "gallery" && (
          <GallerySection
            photos={photos}
            galleryView={galleryView}
            setGalleryView={setGalleryView}
            onPhotoUpload={handlePhotoUpload}
            onPhotoDelete={handleDeletePhoto}
            onPhotoRefresh={handlePhotoRefresh}  // ADD THIS LINE
            countryName={countryName}  // ADD THIS LINE
          />
        )}

        {activeTab === "journal" && (
          <JournalSection
            showJournal={true}
            entry={entry}
            setEntry={setEntry}
            entries={entries}
            setEntries={setEntries}
            handleEntrySubmit={handleEntrySubmit}
            handleEntryUpdate={handleEntryUpdate}
            handleEntryDelete={handleEntryDelete}
            countryName={countryName}
          />
        )}

        {activeTab === "album" && (
          <div className="coming-soon">
            <h2>Album Coming Soon</h2>
            <p>This feature will combine your photos and journal entries into beautiful albums!</p>
            <div style={{ marginTop: '1rem', color: '#2B509E' }}>
              <div>Current content for {countryName}:</div>
              <div>{countryData.stats.photoCount} photos, {countryData.stats.journalCount} journal entries</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountryPage;