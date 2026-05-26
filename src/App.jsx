// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Profile from './views/Profile';
import ResetPassword from './views/ResetPassword';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('partnerUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [currentView, setCurrentView] = useState('dashboard');
  const [resetToken, setResetToken] = useState(null);

  useEffect(() => {
    // 💡 यूआरएल से ?resetToken=xxxx को ढूंढने का सबसे सेफ तरीका
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('resetToken');
    
    if (token) {
      console.log("URL me reset token mila:", token);
      setResetToken(token);
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('partnerUser', JSON.stringify(userData));
    if (!userData.isPaid) {
      setCurrentView('profile');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('dashboard');
    localStorage.removeItem('partnerUser');
  };

  const handleResetComplete = () => {
    setResetToken(null);
    // यूआरएल को पूरी तरह साफ करके क्लीन डोमेन बना देना
    window.history.pushState({}, document.title, "/"); 
  };

  // 🎯 कंडीशन 1: अगर यूआरएल में रीसेट टोकन मौजूद है, तो पासवर्ड बदलने का फॉर्म दिखाओ
  if (resetToken) {
    return <ResetPassword token={resetToken} onComplete={handleResetComplete} />;
  }

  // 🎯 कंडीशन 2: नॉर्मल फ्लो
  return (
    <>
      {!user ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (!user.isPaid || currentView === 'profile') ? (
        <Profile 
          user={user} 
          onBack={() => {
            if (user.isPaid) {
              setCurrentView('dashboard');
            } else {
              alert("🛑 ट्रेनिंग शुरू करने के लिए कृपया पहले फीस का भुगतान करें।");
            }
          }} 
        />
      ) : (
        <Dashboard 
          user={user} 
          setUser={setUser} 
          onLogout={handleLogout} 
          onProfileClick={() => setCurrentView('profile')} 
        />
      )}
    </>
  );
}

export default App;