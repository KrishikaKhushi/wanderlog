import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

// Import the Auth Provider
import { AuthProvider, useAuth } from './context/AuthContext';

// Import components
import GlobeComponent from './pages/Globe.jsx';
import CountryPage from './pages/CountryPage';
import CoverPage from './components/CoverPage';
import ExplorePage from './pages/ExplorePage';
import AccountPage from "./pages/AccountPage";
import EditPage from "./pages/EditPage";
import MyProfile from "./pages/MyProfile";
import MapView from "./components/MapView";
import Social from './pages/Social';
import Friends from './pages/Friends';
import UserProfile from "./pages/UserProfile";
import "leaflet/dist/leaflet.css";

// Loading component
const LoadingScreen = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '1.5rem'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div>🌍</div>
      <div>Loading WanderLog...</div>
    </div>
  </div>
);

// Main App Content (wrapped inside AuthProvider)
function AppContent() {
  const { user, loading, isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  // Show cover page if not authenticated
  if (!isAuthenticated) {
    return (
      <CoverPage
        showLogin={showLogin}
        setShowLogin={setShowLogin}
        user={user}
      />
    );
  }

  // Show main app if authenticated
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GlobeComponent />} />
        <Route path="/countries/:countryCode" element={<CountryPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/edit-profile" element={<EditPage />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/social" element={<Social />} />
        <Route path="/user/:username" element={<UserProfile />} />
        <Route path="/friends" element={<Friends />} />
      </Routes>
    </BrowserRouter>
  );
}

// Root App Component
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}