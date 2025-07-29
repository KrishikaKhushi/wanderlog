// src/components/Gallery/PostModal.jsx
import React, { useState } from "react";
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostActions from "./PostActions";
import PostInfo from "./PostInfo";
import CaptionForm from "./CaptionForm";
import "./PostModal.css";

const PostModal = ({ 
  selectedImage, 
  selectedImageIndex, 
  setSelectedImageIndex, 
  photos, 
  postData = null,
  onClose 
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [postCaption, setPostCaption] = useState(postData?.caption || "");
  const [showCaptionInput, setShowCaptionInput] = useState(false);

  const nextPost = () => {
    if (selectedImageIndex < photos.length - 1) {
      const nextIndex = selectedImageIndex + 1;
      setSelectedImageIndex(nextIndex);
    }
  };

  const prevPost = () => {
    if (selectedImageIndex > 0) {
      const prevIndex = selectedImageIndex - 1;
      setSelectedImageIndex(prevIndex);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleCaptionSubmit = (e) => {
    e.preventDefault();
    console.log("Caption submitted:", postCaption);
    setShowCaptionInput(false);
    // Here you would typically save the caption to your data
  };

  const handleImageSelect = (index) => {
    setSelectedImageIndex(index);
  };

  // Use current image from photos array
  const currentImage = photos[selectedImageIndex];

  return (
    <div className="instagram-post-overlay">
      <div className="instagram-post-container">
        <PostHeader onClose={onClose} />
        
        <PostContent
          selectedImage={currentImage}
          selectedImageIndex={selectedImageIndex}
          photos={photos}
          onPrevPost={prevPost}
          onNextPost={nextPost}
          onImageSelect={handleImageSelect}
        />
        
        <PostActions
          isLiked={isLiked}
          isSaved={isSaved}
          onLike={handleLike}
          onSave={handleSave}
          onToggleCaptionInput={() => setShowCaptionInput(!showCaptionInput)}
        />
        
        <PostInfo
          isLiked={isLiked}
          postCaption={postCaption}
          postData={postData}
        />
        
        {showCaptionInput && (
          <CaptionForm
            postCaption={postCaption}
            setPostCaption={setPostCaption}
            onSubmit={handleCaptionSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default PostModal;