import React from 'react';
import FormGroup from './FormGroup';
import ImageUploadField from './ImageUploadField';
import './EditForm.css';

const EditForm = ({ 
  formData, 
  location, 
  loading, 
  onInputChange, 
  onSubmit, 
  onCancel, 
  onImageSelect 
}) => {
  return (
    <form className="edit-form" onSubmit={onSubmit}>
      <FormGroup 
        label="Full Name"
        name="fullName"
        value={formData.fullName}
        onChange={onInputChange}
        placeholder="Enter your full name"
      />

      <FormGroup 
        label="Username"
        name="username"
        value={formData.username}
        onChange={onInputChange}
        placeholder="Enter your username"
      />

      <FormGroup 
        label="Bio"
        name="bio"
        value={formData.bio}
        onChange={onInputChange}
        placeholder="Tell us something about yourself..."
        type="textarea"
        rows="4"
        maxLength={500}
        showCharacterCount
      />

      <ImageUploadField 
        profilePicture={formData.profilePicture}
        onImageSelect={onImageSelect}
      />

      <FormGroup 
        label="Current Location"
        value={location}
        readOnly
        helpText="This is automatically detected from your device"
      />

      <div className="form-actions">
        <button 
          type="button" 
          className="cancel-button"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="save-profile-button"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default EditForm;