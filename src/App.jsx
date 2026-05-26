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

  // 🚀 1. Password Reset URL Check (Omitted for brevity - but keep your fixed code here)
  useEffect(() => {
    // Check path variable (/reset-password/xxx)
    if (window.location.pathname.includes('/reset-password/')) {
      const parts = window.location.pathname.split('/');
      const token = parts[parts.length - 1];
      if (token) {
        console.log("[APP] Reset Token detected:", token);
        setResetToken(token);
      }
    }
  }, []);

  // 🚀 2. Live Payment Status Sync (Tight & Robust Logic)
  useEffect(() => {
    const checkLivePaymentStatus = async () => {
      // 💡 Check condition: Sirf tabhi sync karega jab user logged in ho, 
      // is session mein sync na hua ho, aur local status 'Unpaid' ho.
      if (user && user.email && !hasSynced && !user.isPaid) {
        try {
          console.log("[APP] Server se live payment status verify kiya ja raha hai...");
          const res = await axios.post("https://training-ewpp-backend.onrender.com/api/auth-utils/get-profile", { email: user.email });
          
          if (res.data && res.data.success) {
            const freshUserData = res.data.user;
            console.log("[APP SUCCESS] Server live status isPaid:", freshUserData.isPaid);
            
            // 💡 Overwrite only if database is definitively 'Paid'.
            // Agar database server delay se false de rha hai, toh local unpaid par rehene do.
            if (freshUserData.isPaid && !user.isPaid) {
              setUser(freshUserData);
              localStorage.setItem('partnerUser', JSON.stringify(freshUserData));
              
              // Database update confirmed - auto switch view
              setCurrentView('dashboard');
            }
          }
        } catch (error) {
          console.error("[APP ERROR] Live status sync fail:", error.message);
        } finally {
          // Set to true regardless of database status, blocking further background calls.
          // This stops the infinite loop and race condition.
          setHasSynced(true);
        }
      }
    };

    checkLivePaymentStatus();
  }, [user]); // 💡 Dependency strictly on 'user' object change.

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('partnerUser', JSON.stringify(userData));
    setHasSynced(false); // New login requires fresh sync.
    
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
    console.log("[APP USER UPDATE] Manual update received:", updatedUserData);
    setUser(updatedUserData);
    localStorage.setItem('partnerUser', JSON.stringify(updatedUserData));
    
    // Set view if database update is confirmed
    if (updatedUserData.isPaid) {
      setCurrentView('dashboard');
      setHasSynced(true); // Treat as synced to block immediate background loop
    }
  };

  // 🎯 CONDITION 1: Password Reset Screen
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
          setUser={handleUserUpdate} 
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