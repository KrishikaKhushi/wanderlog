// src/components/Gallery/UploadOrganizer.jsx
import React, { useState } from "react";
import FolderManager from "./FolderManager";
import PostCreator from "./PostCreator";
import { photoApi, utils } from "../../services/countryApi";
import "./UploadOrganizer.css";

const UploadOrganizer = ({ selectedFiles, onClose, onPost, countryName }) => {
  const [folders, setFolders] = useState([{ id: 1, name: "Post 1", images: [] }]);
  const [unorganizedImages, setUnorganizedImages] = useState(selectedFiles);
  const [currentStep, setCurrentStep] = useState("organize"); // "organize" or "create"
  const [currentFolderIndex, setCurrentFolderIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const addFolder = () => {
    const newFolder = {
      id: folders.length + 1,
      name: `Post ${folders.length + 1}`,
      images: []
    };
    setFolders([...folders, newFolder]);
  };

  const removeFolder = (folderId) => {
    if (folders.length <= 1) return; // Keep at least one folder
    
    const folderToRemove = folders.find(f => f.id === folderId);
    const updatedFolders = folders.filter(f => f.id !== folderId);
    
    // Return images back to unorganized
    setUnorganizedImages(prev => [...prev, ...folderToRemove.images]);
    setFolders(updatedFolders);
  };

  const moveImageToFolder = (imageUrl, folderId) => {
    // Remove from unorganized
    setUnorganizedImages(prev => prev.filter(img => img !== imageUrl));
    
    // Add to folder
    setFolders(prev => prev.map(folder => 
      folder.id === folderId 
        ? { ...folder, images: [...folder.images, imageUrl] }
        : folder
    ));
  };

  const removeImageFromFolder = (imageUrl, folderId) => {
    // Remove from folder
    setFolders(prev => prev.map(folder => 
      folder.id === folderId 
        ? { ...folder, images: folder.images.filter(img => img !== imageUrl) }
        : folder
    ));
    
    // Add back to unorganized
    setUnorganizedImages(prev => [...prev, imageUrl]);
  };

  const handleOrganizeComplete = () => {
    // Filter out empty folders
    const nonEmptyFolders = folders.filter(folder => folder.images.length > 0);
    if (nonEmptyFolders.length === 0) {
      alert("Please add at least one image to a folder before proceeding.");
      return;
    }
    setFolders(nonEmptyFolders);
    setCurrentStep("create");
  };

  const handlePostCreated = (folderIndex, postData) => {
    // Update folder with post data
    setFolders(prev => prev.map((folder, index) => 
      index === folderIndex 
        ? { ...folder, ...postData }
        : folder
    ));
    
    // Move to next folder or complete
    if (folderIndex < folders.length - 1) {
      setCurrentFolderIndex(folderIndex + 1);
    } else {
      handleAllPostsComplete();
    }
  };

  // NEW: Convert base64 URLs to photo data for backend
  const preparePhotosForUpload = (imageUrls) => {
    return imageUrls.map((url, index) => {
      // Extract filename from the data URL or create one
      const timestamp = Date.now();
      const filename = `photo-${timestamp}-${index}.jpg`;
      
      return {
        base64: url,
        filename: filename,
        caption: '',
        tags: [],
        isPublic: false
      };
    });
  };

  const handleAllPostsComplete = async () => {
    if (!countryName) {
      console.error('❌ Country name not provided to UploadOrganizer');
      alert('Error: Country information missing. Please try again.');
      return;
    }

    setIsUploading(true);
    
    try {
      console.log('📸 Starting backend upload process for country:', countryName);
      
      // Get all unique images from all folders
      const allImages = [...new Set(folders.flatMap(folder => folder.images))];
      console.log('📸 Total unique images to upload:', allImages.length);
      
      if (allImages.length === 0) {
        console.log('📸 No images to upload');
        onPost([]);
        onClose();
        return;
      }
      
      // Prepare photos for backend upload
      const photosForUpload = preparePhotosForUpload(allImages);
      const apiCountryCode = utils.getCountryCode(countryName);
      
      console.log('📸 Country code:', apiCountryCode);
      console.log('📸 Photos prepared for upload:', photosForUpload.length);
      
      // Upload all photos to backend
      const response = await photoApi.uploadPhotosBase64(photosForUpload, countryName, apiCountryCode);
      
      if (response.success) {
        console.log('✅ Photos uploaded to backend successfully:', response.photos.length);
        
        // Create a mapping from base64 URLs to backend photo URLs
        const urlMapping = {};
        response.photos.forEach((photo, index) => {
          if (allImages[index]) {
            urlMapping[allImages[index]] = photo.url;
          }
        });
        
        // Convert folders to posts with backend photo URLs
        const posts = folders.map((folder, index) => ({
          id: Date.now() + Math.random() + index,
          images: folder.images.map(img => urlMapping[img] || img), // Use backend URLs
          caption: folder.caption || "",
          taggedPeople: folder.taggedPeople || [],
          location: folder.location || "",
          hideFromFeed: folder.hideFromFeed || false,
          turnOffComments: folder.turnOffComments || false,
          likes: 0, // Start with 0 likes
          comments: 0, // Start with 0 comments
          timestamp: new Date(),
          folderName: folder.name,
          backendPhotos: response.photos.filter((photo, photoIndex) => 
            folder.images.includes(allImages[photoIndex])
          )
        }));
        
        console.log('✅ Posts created with backend integration:', posts.length);
        
        // Notify parent component with both posts AND individual photos
        onPost(posts, response.photos);
        onClose();
        
        // Show success message
        alert(`Successfully uploaded ${response.photos.length} photos to ${countryName}!`);
        
      } else {
        throw new Error('Backend upload failed');
      }
      
    } catch (error) {
      console.error('❌ Error uploading photos to backend:', error);
      alert('Error uploading photos. Please try again.');
      
      // Fallback: create local posts without backend integration
      const posts = folders.map((folder, index) => ({
        id: Date.now() + Math.random() + index,
        images: folder.images,
        caption: folder.caption || "",
        taggedPeople: folder.taggedPeople || [],
        location: folder.location || "",
        hideFromFeed: folder.hideFromFeed || false,
        turnOffComments: folder.turnOffComments || false,
        likes: 0,
        comments: 0,
        timestamp: new Date(),
        folderName: folder.name,
        isLocalOnly: true // Flag to indicate this wasn't saved to backend
      }));
      
      onPost(posts);
      onClose();
    } finally {
      setIsUploading(false);
    }
  };

  const goBackToOrganize = () => {
    setCurrentStep("organize");
    setCurrentFolderIndex(0);
  };

  return (
    <div className="upload-organizer-overlay">
      <div className="upload-organizer-container">
        <div className="organizer-header">
          <h3>
            {currentStep === "organize" 
              ? "Organize Your Photos" 
              : `Create Post ${currentFolderIndex + 1} of ${folders.length}`
            }
          </h3>
          <button className="organizer-close" onClick={onClose} disabled={isUploading}>
            ×
          </button>
        </div>

        {isUploading && (
          <div className="uploading-indicator">
            <p>📸 Uploading photos to {countryName}...</p>
            <div className="upload-progress">Please wait...</div>
          </div>
        )}

        {currentStep === "organize" ? (
          <FolderManager
            folders={folders}
            unorganizedImages={unorganizedImages}
            onAddFolder={addFolder}
            onRemoveFolder={removeFolder}
            onMoveImageToFolder={moveImageToFolder}
            onRemoveImageFromFolder={removeImageFromFolder}
            onComplete={handleOrganizeComplete}
            disabled={isUploading}
          />
        ) : (
          <PostCreator
            folder={folders[currentFolderIndex]}
            folderIndex={currentFolderIndex}
            totalFolders={folders.length}
            onPostCreated={handlePostCreated}
            onBack={goBackToOrganize}
            disabled={isUploading}
          />
        )}
      </div>
    </div>
  );
};

export default UploadOrganizer;