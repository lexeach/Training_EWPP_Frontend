import LandscapeAlert from './components/LandscapeAlert'; 
import React, { useState, useEffect } from 'react';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Profile from './views/Profile';
import ResetPassword from './views/ResetPassword';
import axios from 'axios';
import AdminPanel from './views/AdminPanel'; 
import TestListPage from './views/TestListPage';
import Footer from './components/Footer'; 
import Loader from './components/Loader'; // 🟢 लोडर इम्पोर्ट किया

function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('partnerUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("LocalStorage parsing error", e);
      return null;
    }
  });

  const [currentView, setCurrentView] = useState('dashboard'); 
  const [resetToken, setResetToken] = useState(null);
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // 🟢 ऐप लोड हैंडलिंग

  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath === '/admin' || currentPath === '/admin/') setIsAdminRoute(true);
    if (currentPath.includes('/reset-password/')) {
      const parts = currentPath.split('/');
      const token = parts[parts.length - 1];
      if (token) setResetToken(token);
    }
    
    // ऐप लोड होते ही एक बार डेटा सिंक करें
    const syncData = async () => {
      if (user) {
        try {
           const res = await axios.post("https://training-ewpp-backend.onrender.com/api/auth-utils/get-profile", { email: user.email });
           if (res.data?.success && res.data.user) {
             setUser(res.data.user);
             localStorage.setItem('partnerUser', JSON.stringify(res.data.user));
           }
        } catch (err) {
          console.error("Initial Sync Failed", err);
        }
      }
      setInitialLoading(false);
    };
    syncData();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('partnerUser', JSON.stringify(userData));
    setCurrentView(userData.isPaid ? 'dashboard' : 'profile');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('dashboard');
    localStorage.removeItem('partnerUser');
    localStorage.removeItem('token');
  };

  const handleUserUpdateFromProfile = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('partnerUser', JSON.stringify(updatedUserData));
    if (updatedUserData?.isPaid) setCurrentView('dashboard');
  };

  if (initialLoading) return <Loader />; // 🟢 जब तक डेटा सिंक न हो, लोडर दिखाएं

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <LandscapeAlert />
      
      <div style={{ flex: '1' }}>
        {resetToken ? (
          <ResetPassword token={resetToken} onComplete={() => window.location.href = "/"} />
        ) : isAdminRoute ? (
          <AdminPanel onBack={() => setIsAdminRoute(false)} />
        ) : !user ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : currentView === 'profile' ? (
          <Profile user={user} setUser={handleUserUpdateFromProfile} onBack={() => setCurrentView('dashboard')} />
        ) : (
          <Dashboard user={user} setUser={setUser} onLogout={handleLogout} onProfileClick={() => setCurrentView('profile')} />
        )}
      </div>
      
      <Footer /> 
    </div>
  );
}

export default App;
