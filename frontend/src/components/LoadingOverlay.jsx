import React from 'react';

const LoadingOverlay = ({ loading, message = "Loading..." }) => {
  if (!loading) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(255, 255, 255, 0.9)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(5px)'
    }}>
      {/* Loading Spinner */}
      <div style={{
        width: '60px',
        height: '60px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #2B509E',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '20px'
      }} />
      
      {/* Loading Message */}
      <div style={{
        fontSize: '1.2rem',
        color: '#333',
        fontWeight: '500',
        textAlign: 'center',
        maxWidth: '300px'
      }}>
        {message}
      </div>

      {/* Loading Dots Animation */}
      <div style={{
        marginTop: '10px',
        display: 'flex',
        gap: '5px'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#2B509E',
          animation: 'bounce 1.4s ease-in-out infinite both',
          animationDelay: '0s'
        }} />
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#2B509E',
          animation: 'bounce 1.4s ease-in-out infinite both',
          animationDelay: '0.16s'
        }} />
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#2B509E',
          animation: 'bounce 1.4s ease-in-out infinite both',
          animationDelay: '0.32s'
        }} />
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingOverlay;