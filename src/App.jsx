// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Profile from './views/Profile';
import ResetPassword from './views/ResetPassword';
import axios from 'axios';

function App() {
  // LocalStorage se session check karna
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('partnerUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' ya 'profile'
  const [resetToken, setResetToken] = useState(null);
  const [hasSynced, setHasSynced] = useState(false);

  // 🚀 1. Robust Password Reset URL Check (Fixes Blank Screen)
  useEffect(() => {
    // Check query param (?resetToken=xxx)
    const queryParams = new URLSearchParams(window.location.search);
    let token = queryParams.get('resetToken');

    // Check path variable (/reset-password/xxx)
    if (!token && window.location.pathname.includes('/reset-password/')) {
      const parts = window.location.pathname.split('/');
      token = parts[parts.length - 1];
    }

    if (token) {
      console.log("[APP] Reset Token detected:", token);
      setResetToken(token);
    }
  }, []);

  // 🚀 2. Live Payment Status Sync
  useEffect(() => {
    const checkLivePaymentStatus = async () => {
      if (user && user.email && !hasSynced) {
        try {
          console.log("[APP] Server se live payment status verify kiya ja raha hai...");
          const res = await axios.post("https://training-ewpp-backend.onrender.com/api/auth-utils/get-profile", { email: user.email });
          
          if (res.data && res.data.success) {
            const freshUserData = res.data.user;
            console.log("[APP SUCCESS] Server live status isPaid:", freshUserData.isPaid);
            
            if (freshUserData.isPaid !== user.isPaid) {
              setUser(freshUserData);
              localStorage.setItem('partnerUser', JSON.stringify(freshUserData));
              
              // Agar background mein database paid mila to auto dashboard view set karein
              if (freshUserData.isPaid) {
                setCurrentView('dashboard');
              }
            }
          }
        } catch (error) {
          console.error("[APP ERROR] Live status sync fail:", error.message);
        } finally {
          setHasSynced(true);
        }
      }
    };

    checkLivePaymentStatus();
  }, [hasSynced]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('partnerUser', JSON.stringify(userData));
    setHasSynced(false);
    
    if (!userData.isPaid) {
      setCurrentView('profile');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('dashboard');
    setHasSynced(false);
    localStorage.removeItem('partnerUser');
  };

  const handleResetComplete = () => {
    setResetToken(null);
    window.history.pushState({}, document.title, "/"); 
    window.location.href = "/"; // Force redirect to clean route
  };

  // Custom function to handle direct user update from components (like Profile.jsx)
  const handleUserUpdate = (updatedUserData) => {
    setUser(updatedUserData);
    if (updatedUserData.isPaid) {
      setCurrentView('dashboard'); // 💡 Payment success hote hi turant dashboard view set karega
    }
  };

  // 🎯 CONDITION 1: Password Reset Screen (Fixes Blank Page)
  if (resetToken) {
    return <ResetPassword token={resetToken} onComplete={handleResetComplete} />;
  }

  // 🎯 CONDITION 2: Auth & Core App Flow
  return (
    <>
      {!user ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (!user.isPaid || currentView === 'profile') ? (
        // 🔒 Profile View / Payment Required Screen
        <Profile 
          user={user} 
          setUser={handleUserUpdate} // 💡 Ab custom handler view ko toggle karega
          onBack={() => {
            if (user.isPaid) {
              setCurrentView('dashboard');
            } else {
              alert("🛑 ट्रेनिंग शुरू करने के लिए कृपया पहले फीस का भुगतान करें।");
            }
          }} 
        />
      ) : (
        // 🟢 Main Authorized Dashboard
        <Dashboard 
          user={user} 
          setUser={handleUserUpdate} 
          onLogout={handleLogout} 
          onProfileClick={() => setCurrentView('profile')} 
        />
      )}
    </>
  );
}

export default App;