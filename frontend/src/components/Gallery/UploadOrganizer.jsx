// src/components/Gallery/UploadOrganizer.jsx
import React, { useState } from "react";
import FolderManager from "./FolderManager";
import PostCreator from "./PostCreator";
import { postApi, utils } from "../../services/countryApi"; // Changed: Import postApi instead of photoApi
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
        isPhotoPublic: false
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
      console.log('📝 Starting post creation process for country:', countryName);
      
      const apiCountryCode = utils.getCountryCode(countryName);
      const createdPosts = [];
      
      // Create a post for each non-empty folder
      for (const folder of folders) {
        if (folder.images.length === 0) continue;
        
        console.log(`📝 Creating post "${folder.name}" with ${folder.images.length} photos`);
        
        // Prepare photos for this post
        const photosForUpload = preparePhotosForUpload(folder.images);
        
        // Create post with upload using the new API
        const postData = {
          photos: photosForUpload,
          country: countryName,
          countryCode: apiCountryCode,
          title: folder.name || '',
          description: folder.caption || '',
          tags: folder.taggedPeople || [],
          isPublic: !folder.hideFromFeed
        };
        
        try {
          const response = await postApi.createPostWithUpload(postData);
          
          if (response.success) {
            console.log(`✅ Post "${folder.name}" created successfully`);
            
            // Convert the backend post to display format
            const displayPost = {
              id: response.post._id,
              title: response.post.title,
              description: response.post.description,
              images: response.post.photos.map(photo => ({
                id: photo._id,
                url: photo.url,
                caption: photo.caption,
                tags: photo.tags,
                uploadedAt: photo.uploadedAt,
                isPublic: photo.isPublic,
                likes: photo.likes || [],
                views: photo.views || 0
              })),
              tags: response.post.tags,
              isPublic: response.post.isPublic,
              likes: response.post.likes || [],
              comments: response.post.comments || [],
              views: response.post.views || 0,
              createdAt: response.post.createdAt,
              photoCount: response.post.photos.length,
              folderName: folder.name
            };
            
            createdPosts.push(displayPost);
            
          } else {
            console.error(`❌ Failed to create post "${folder.name}":`, response.message);
          }
          
        } catch (postError) {
          console.error(`❌ Error creating post "${folder.name}":`, postError);
        }
      }
      
      if (createdPosts.length > 0) {
        console.log(`✅ Successfully created ${createdPosts.length} posts`);
        
        // Notify parent component
        onPost(createdPosts);
        onClose();
        
        // Show success message
        alert(`Successfully created ${createdPosts.length} posts in ${countryName}!`);
        
      } else {
        throw new Error('No posts were created successfully');
      }
      
    } catch (error) {
      console.error('❌ Error creating posts:', error);
      alert('Error creating posts. Please try again.');
      
      // Fallback: create local posts without backend integration
      const localPosts = folders.filter(folder => folder.images.length > 0).map((folder, index) => ({
        id: Date.now() + Math.random() + index,
        images: folder.images.map(img => ({ url: img })),
        caption: folder.caption || "",
        taggedPeople: folder.taggedPeople || [],
        location: folder.location || "",
        hideFromFeed: folder.hideFromFeed || false,
        turnOffComments: folder.turnOffComments || false,
        likes: [],
        comments: [],
        views: 0,
        timestamp: new Date(),
        folderName: folder.name,
        isLocalOnly: true // Flag to indicate this wasn't saved to backend
      }));
      
      onPost(localPosts);
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
            <p>📝 Creating posts in {countryName}...</p>
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