import React from 'react';
import './FormGroup.css';

const FormGroup = ({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder, 
  type = 'input', 
  rows, 
  readOnly = false,
  maxLength,
  showCharacterCount = false,
  helpText 
}) => {
  return (
    <div className="form-group">
      <label>{label}</label>
      {type === 'textarea' ? (
        <textarea 
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          readOnly={readOnly}
          maxLength={maxLength}
        />
      ) : (
        <input 
          type="text" 
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          maxLength={maxLength}
        />
      )}
      {showCharacterCount && maxLength && (
        <small>{value?.length || 0}/{maxLength} characters</small>
      )}
      {helpText && <small>{helpText}</small>}
    </div>
  );
};

export default FormGroup;