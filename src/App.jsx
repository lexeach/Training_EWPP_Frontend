// frontend/src/App.jsx
import LandscapeAlert from './components/LandscapeAlert'; // 🎯 अलर्ट इम्पोर्टेड (अभी null है)
import React, { useState, useEffect } from 'react';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Profile from './views/Profile';
import ResetPassword from './views/ResetPassword';
import axios from 'axios';
import AdminPanel from './views/AdminPanel'; 
import TestListPage from './views/TestListPage';
import Footer from './components/Footer'; // 🟢 फुटर इम्पोर्टेड

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
  const [hasSynced, setHasSynced] = useState(false);
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath === '/admin' || currentPath === '/admin/') setIsAdminRoute(true);
    if (currentPath.includes('/reset-password/')) {
      const parts = currentPath.split('/');
      const token = parts[parts.length - 1];
      if (token) setResetToken(token);
    }
  }, []);

  useEffect(() => {
    const fetchFreshUserOnLoad = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await axios.get('https://training-ewpp-backend.onrender.com/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data?.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('partnerUser', JSON.stringify(res.data.user));
          }
        }
      } catch (err) {
        console.error("[APP ERROR] ताज़ा यूज़र डेटा सिंक फेल:", err.message);
      }
    };
    fetchFreshUserOnLoad();
  }, []);

  useEffect(() => {
    const checkLivePaymentStatus = async () => {
      if (user && user.email && !hasSynced && !user.isPaid) {
        try {
          const res = await axios.post("https://training-ewpp-backend.onrender.com/api/auth-utils/get-profile", { email: user.email });
          if (res.data?.success && res.data.user?.isPaid) {
            setUser(res.data.user);
            localStorage.setItem('partnerUser', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.error("[APP ERROR] लाइव स्टेटस सिंक फेल:", error.message);
        } finally {
          setHasSynced(true);
        }
      }
    };
    checkLivePaymentStatus();
  }, [hasSynced, user]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('partnerUser', JSON.stringify(userData));
    setHasSynced(false);
    setCurrentView(userData.isPaid ? 'dashboard' : 'profile');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('dashboard');
    setHasSynced(false);
    localStorage.removeItem('partnerUser');
  };

  const handleResetComplete = () => {
    setResetToken(null);
    window.location.href = "/";
  };

  const handleUserUpdateFromProfile = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('partnerUser', JSON.stringify(updatedUserData));
    if (updatedUserData?.isPaid) setCurrentView('dashboard');
  };

  const handleAdminBack = () => {
    setIsAdminRoute(false);
    window.history.pushState({}, document.title, "/");
  };

  const renderMainContent = () => {
    if (resetToken) return <ResetPassword token={resetToken} onComplete={handleResetComplete} />;
    if (isAdminRoute) return <AdminPanel onBack={handleAdminBack} />;

    return (
      <>
        {!user ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
          /* 🟢 लॉजिक अपडेट: अगर यूजर Paid है OR 'profile' view में है, तभी Profile दिखाएं। 
             अन्यथा, उसे Dashboard दिखाएं ताकि वो फ्री वीडियो देख सके। */
          (currentView === 'profile') ? ( 
            <Profile 
              user={user} 
              setUser={handleUserUpdateFromProfile} 
              onBack={() => setCurrentView('dashboard')} 
            />
          ) : (
            <Dashboard 
              user={user} 
              setUser={setUser} 
              onLogout={handleLogout} 
              onProfileClick={() => setCurrentView('profile')} 
            />
          )
        )}
      </>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* 🎯 LandscapeAlert रेंडर होगा (जो साइलेंट/null है) */}
      <LandscapeAlert />
      
      {/* 🟢 मुख्य कंटेंट */}
      <div style={{ flex: '1' }}>
        {renderMainContent()}
      </div>
      
      {/* 🟢 फुटर अब यहाँ हमेशा दिखेगा */}
      <Footer /> 
    </div>
  );
}

export default App;
