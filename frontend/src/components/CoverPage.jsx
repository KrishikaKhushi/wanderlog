import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import coverImage from '../assets/cover.jpg';
import LoginModal from './LoginModal';
import './CoverPage.css';

export default function CoverPage({ showLogin, setShowLogin }) {
  const { login, register } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // The actual login is handled by the LoginModal component
    // This function is called when login is successful
    console.log('✅ Login successful, redirecting to main app...');
  };

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        backgroundImage: `url(${coverImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Blur Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '100%',
          backdropFilter: 'blur(2px)',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 0,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
        }}
      >
        {/* Animated Text - Wanderbook */}
        <svg viewBox="0 0 700 150" width="700" height="150" style={{ marginBottom: '-2rem' }}>
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="140"
            fontFamily="'Vujahday Script', cursive"
            fill="#2B509E"
            stroke="white"
            strokeWidth="4"
            strokeDasharray="1000"
            strokeDashoffset="1000"
            className="draw-text"
          >
            Wanderlog
          </text>
        </svg>

        <p
          className="fade-in-delayed"
          style={{
            fontFamily: "'Vollkorn', serif",
            fontSize: '1.8rem',
            fontWeight: 'bold',
            marginTop: '1rem',
            marginBottom: '2rem',
          }}
        >
          Your Travel Scrapbook
        </p>

        {/* Action Button */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => setShowLogin(true)}
            style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #2B509E, #6696ff)',
              color: 'white',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
              transition: 'transform 0.2s ease',
              fontSize: '1.1rem',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Login / Sign Up
          </button>
        </div>

        {/* Feature Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          maxWidth: '800px',
          margin: '3rem 0 2rem 0',
          padding: '0 2rem'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '1.5rem',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📍</div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>Track Your Journey</h3>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Pin countries you've visited and places you dream to explore</p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '1.5rem',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📖</div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>Travel Scrapbook</h3>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Create beautiful memories of your adventures</p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '1.5rem',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌍</div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>Interactive Globe</h3>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Beautiful 3D globe with floating pin animations</p>
          </div>
        </div>

        {/* Footer Text */}
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          opacity: 0.8,
          fontSize: '0.9rem',
          textAlign: 'center'
        }}>
          Start documenting your adventures today ✈️
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLogin={handleLogin}
        />
      )}
    </div>
  );
}
