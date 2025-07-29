import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";
import ProfilePreview from "../components/EditMenu/ProfilePreview";
import EditForm from "../components/EditMenu/EditForm";
import ImageSourceModal from "../components/EditMenu/ImageSourceModal";
import ImageCropModal from "../components/EditMenu/ImageCropModal";
import "./EditPage.css";

const EditPage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    bio: '',
    profilePicture: null
  });
  
  const [location, setLocation] = useState("Fetching location...");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  
  // Picture selection and crop states
  const [showImageSourceModal, setShowImageSourceModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      
      setFormData({
        fullName: fullName,
        username: user.username || '',
        bio: user.bio || '',
        profilePicture: null
      });
      
      if (user.profilePicture) {
        setProfilePicturePreview(user.profilePicture);
      }
    }
  }, [user]);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();
            const city = data.address.city || data.address.town || data.address.village || "Your Area";
            const country = data.address.country || "";
            setLocation(`${city}, ${country}`);
          } catch (err) {
            console.error('Location fetch error:', err);
            setLocation("Location unavailable");
          }
        },
        () => {
          setLocation("Permission denied");
        }
      );
    } else {
      setLocation("Geolocation not supported");
    }
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setMessage({ type: '', text: '' });
  };

  // Handle picture source selection
  const handlePictureSourceSelect = (source, file = null) => {
    setShowImageSourceModal(false);
    
    if (source === 'drive') {
      setMessage({ type: 'error', text: 'Google Drive integration coming soon!' });
      return;
    }

    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select an image file' });
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
        return;
      }

      // Create image preview for cropping
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target.result);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle crop save
  const handleCropSave = (croppedImageData, croppedFile) => {
    setFormData(prev => ({ ...prev, profilePicture: croppedFile }));
    setProfilePicturePreview(croppedImageData);
    setShowCropModal(false);
    setOriginalImage(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const jsonData = {
        firstName: firstName,
        lastName: lastName,
        username: formData.username,
        bio: formData.bio
      };

      const response = await API.put('/auth/profile', jsonData);

      if (response.data.success) {
        updateUser(response.data.user);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        
        setTimeout(() => {
          navigate(-1);
        }, 1500);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = () => {
    return formData.fullName || user?.firstName + ' ' + user?.lastName || formData.username || user?.username || 'User';
  };

  return (
    <div className="edit-page">
      <div className="edit-header">
        <button className="back-button" onClick={() => navigate(-1)}>←</button>
        <h1>Edit Profile</h1>
      </div>

      <ProfilePreview 
        profilePicturePreview={profilePicturePreview}
        displayName={getDisplayName()}
        username={formData.username}
        location={location}
      />

      {/* Message Display */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <EditForm 
        formData={formData}
        location={location}
        loading={loading}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        onImageSelect={() => setShowImageSourceModal(true)}
      />

      <ImageSourceModal 
        isOpen={showImageSourceModal}
        onClose={() => setShowImageSourceModal(false)}
        onSourceSelect={handlePictureSourceSelect}
      />

      <ImageCropModal 
        isOpen={showCropModal}
        originalImage={originalImage}
        onClose={() => setShowCropModal(false)}
        onSave={handleCropSave}
      />
    </div>
  );
};

export default EditPage;