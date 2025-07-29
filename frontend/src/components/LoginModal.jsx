import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './LoginModal.css';

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 
                         process.env.REACT_APP_GOOGLE_CLIENT_ID || 
                         'your-google-client-id';

export default function LoginModal({ onClose, onLogin }) {
  const { login, register, googleLogin } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  // Registration form state
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });

  // Load Google Identity Services
  useEffect(() => {
    const loadGoogleScript = () => {
      if (document.getElementById('google-identity-script')) return;
      
      const script = document.createElement('script');
      script.id = 'google-identity-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.head.appendChild(script);
    };

    const initializeGoogleSignIn = () => {
      if (window.google && GOOGLE_CLIENT_ID !== 'your-google-client-id') {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: false
        });
      }
    };

    loadGoogleScript();
  }, []);

  const handleGoogleResponse = async (response) => {
    setGoogleLoading(true);
    setError('');
    
    try {
      console.log('🔐 Google response received:', response.credential ? 'Token present' : 'No token');
      
      const result = await googleLogin(response.credential);
      
      if (result.success) {
        console.log('✅ Google login successful!');
        setSuccess('Welcome! Logged in with Google successfully.');
        setTimeout(() => {
          onLogin();
          onClose();
        }, 1000);
      } else {
        setError(result.message || 'Google login failed');
      }
    } catch (error) {
      console.error('❌ Google login error:', error);
      setError('Google login failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (!window.google) {
      setError('Google Sign-In is not loaded. Please refresh and try again.');
      return;
    }

    if (GOOGLE_CLIENT_ID === 'your-google-client-id') {
      setError('Google Sign-In is not configured. Please contact support.');
      return;
    }

    setGoogleLoading(true);
    setError('');
    
    try {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to popup
          window.google.accounts.id.renderButton(
            document.getElementById('google-signin-temp'),
            {
              theme: 'outline',
              size: 'large',
              width: '100%'
            }
          );
          document.getElementById('google-signin-temp')?.querySelector('div')?.click();
        }
        setGoogleLoading(false);
      });
    } catch (error) {
      console.error('❌ Google Sign-In error:', error);
      setError('Failed to initialize Google Sign-In');
      setGoogleLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!loginData.email || !loginData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const result = await login(loginData.email, loginData.password);
      
      if (result.success) {
        console.log('✅ Login successful!');
        onLogin();
        onClose();
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!registerData.username || !registerData.email || !registerData.password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(registerData.username)) {
      setError('Username can only contain letters, numbers, and underscores');
      setLoading(false);
      return;
    }

    if (registerData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      setLoading(false);
      return;
    }

    try {
      const registrationData = {
        username: registerData.username.trim(),
        email: registerData.email.trim().toLowerCase(),
        password: registerData.password,
        firstName: registerData.firstName.trim(),
        lastName: registerData.lastName.trim()
      };

      console.log('📝 Attempting registration with:', {
        ...registrationData,
        password: '[HIDDEN]'
      });

      const result = await register(registrationData);
      
      if (result.success) {
        setSuccess('Account created successfully! Welcome to Wanderbook!');
        console.log('✅ Registration successful!');
        
        setTimeout(() => {
          onLogin();
          onClose();
        }, 1500);
      } else {
        if (result.errors && result.errors.length > 0) {
          setError(result.errors.join(', '));
        } else {
          setError(result.message || 'Registration failed');
        }
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      setError('An unexpected error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === 'login') {
      setLoginData(prev => ({ ...prev, [name]: value }));
    } else {
      setRegisterData(prev => ({ ...prev, [name]: value }));
    }
    setError('');
    setSuccess('');
  };

  const switchToLogin = () => {
    setIsLogin(true);
    setError('');
    setSuccess('');
    setLoginData({ email: '', password: '' });
  };

  const switchToRegister = () => {
    setIsLogin(false);
    setError('');
    setSuccess('');
    setRegisterData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: ''
    });
  };

  const handleQuickFill = () => {
    if (isLogin) {
      setLoginData({
        email: 'test@wanderbook.com',
        password: 'test123'
      });
    } else {
      setRegisterData({
        username: 'testuser',
        email: 'test@wanderbook.com',
        password: 'test123',
        confirmPassword: 'test123',
        firstName: 'Test',
        lastName: 'User'
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close-button"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>

        <div className="modal-tabs">
          <button
            className={`modal-tab ${isLogin ? 'active' : ''}`}
            onClick={switchToLogin}
          >
            Login
          </button>
          <button
            className={`modal-tab ${!isLogin ? 'active' : ''}`}
            onClick={switchToRegister}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="modal-error">
            {error}
          </div>
        )}

        {success && (
          <div className="modal-success">
            {success}
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleLoginSubmit}>
            <h2 className="modal-title">Welcome Back!</h2>
            
            {/* Google Sign-In Button */}
            <button
              type="button"
              className="modal-google-button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
            >
              {googleLoading ? (
                <span>Signing in with Google...</span>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            <div className="modal-divider">
              <span>or</span>
            </div>
            
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="modal-input"
              value={loginData.email}
              onChange={(e) => handleInputChange(e, 'login')}
              autoComplete="email"
              required
            />
            
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="modal-input"
              value={loginData.password}
              onChange={(e) => handleInputChange(e, 'login')}
              autoComplete="current-password"
              required
            />
            
            <button 
              type="submit" 
              className="modal-login-button"
              disabled={loading || googleLoading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <button
              type="button"
              onClick={handleQuickFill}
              className="modal-quick-fill"
            >
              Quick fill (for testing)
            </button>

            <div className="modal-switch-text">
              Don't have an account? 
              <button
                type="button"
                onClick={switchToRegister}
                className="modal-switch-button"
              >
                Sign up here
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit}>
            <h2 className="modal-title">Join Wanderbook!</h2>
            
            {/* Google Sign-Up Button */}
            <button
              type="button"
              className="modal-google-button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
            >
              {googleLoading ? (
                <span>Signing up with Google...</span>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
                </>
              )}
            </button>

            <div className="modal-divider">
              <span>or</span>
            </div>
            
            <div className="modal-row">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                className="modal-input modal-input-half"
                value={registerData.firstName}
                onChange={(e) => handleInputChange(e, 'register')}
                autoComplete="given-name"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                className="modal-input modal-input-half"
                value={registerData.lastName}
                onChange={(e) => handleInputChange(e, 'register')}
                autoComplete="family-name"
              />
            </div>
            
            <input
              type="text"
              name="username"
              placeholder="Username (letters, numbers, _ only) *"
              className="modal-input"
              value={registerData.username}
              onChange={(e) => handleInputChange(e, 'register')}
              autoComplete="username"
              required
            />
            
            <input
              type="email"
              name="email"
              placeholder="Email *"
              className="modal-input"
              value={registerData.email}
              onChange={(e) => handleInputChange(e, 'register')}
              autoComplete="email"
              required
            />
            
            <input
              type="password"
              name="password"
              placeholder="Password (min 6 characters) *"
              className="modal-input"
              value={registerData.password}
              onChange={(e) => handleInputChange(e, 'register')}
              autoComplete="new-password"
              required
            />
            
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password *"
              className="modal-input"
              value={registerData.confirmPassword}
              onChange={(e) => handleInputChange(e, 'register')}
              autoComplete="new-password"
              required
            />
            
            <button 
              type="submit" 
              className="modal-login-button"
              disabled={loading || googleLoading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <button
              type="button"
              onClick={handleQuickFill}
              className="modal-quick-fill"
            >
              Quick fill (for testing)
            </button>

            <div className="modal-switch-text">
              Already have an account? 
              <button
                type="button"
                onClick={switchToLogin}
                className="modal-switch-button"
              >
                Login here
              </button>
            </div>
          </form>
        )}

        {/* Hidden element for Google Sign-In fallback */}
        <div id="google-signin-temp" style={{ display: 'none' }}></div>
      </div>
    </div>
  );
}