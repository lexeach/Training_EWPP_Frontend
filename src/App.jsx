// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Profile from './views/Profile';
import ResetPassword from './views/ResetPassword';
import axios from 'axios';

function App() {
  // लोकलस्टोरेज से यूजर का शुरुआती सेशन निकालना
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('partnerUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("LocalStorage parsing error", e);
      return null;
    }
  });

  // 💡 सुपर सेफ सुधार: शुरुआत में इसे हमेशा 'dashboard' रखें, क्रैश होने का चांस ही खत्म!
  const [currentView, setCurrentView] = useState('dashboard'); 
  const [resetToken, setResetToken] = useState(null);
  const [hasSynced, setHasSynced] = useState(false);

  // 🚀 1. पासवर्ड रीसेट टोकन चेक
  useEffect(() => {
    if (window.location.pathname.includes('/reset-password/')) {
      const parts = window.location.pathname.split('/');
      const token = parts[parts.length - 1];
      if (token) {
        setResetToken(token);
      }
    }
  }, []);

  // 🚀 2. लाइव पेमेंट स्टेटस सिंक (केवल शुरुआती फ्रेश लोड पर बैकएंड से चेक करेगा)
  useEffect(() => {
    const checkLivePaymentStatus = async () => {
      if (user && user.email && !hasSynced && !user.isPaid) {
        try {
          console.log("[APP] सर्वर से लाइव पेमेंट स्टेटस वेरीफाई किया जा रहा है...");
          const res = await axios.post("https://training-ewpp-backend.onrender.com/api/auth-utils/get-profile", { email: user.email });
          
          if (res.data && res.data.success) {
            const freshUserData = res.data.user;
            if (freshUserData && freshUserData.isPaid) {
              setUser(freshUserData);
              localStorage.setItem('partnerUser', JSON.stringify(freshUserData));
            }
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
    window.location.href = "/";
  };

  // 💡 प्रोफाइल से पेमेंट सक्सेस होने पर यह मास्टर हैंडलर तुरंत व्यू और स्टेट दोनों बदल देगा
  const handleUserUpdateFromProfile = (updatedUserData) => {
    console.log("[APP] प्रोफाइल से लाइव डेटा अपडेट मिला:", updatedUserData);
    setUser(updatedUserData);
    localStorage.setItem('partnerUser', JSON.stringify(updatedUserData));
    
    if (updatedUserData && updatedUserData.isPaid) {
      setCurrentView('dashboard'); // 🚀 सीधे और सुरक्षित तरीके से डैशबोर्ड पर भेजें
    }
  };

  // 🎯 कंडीशन 1: पासवर्ड रीसेट स्क्रीन
  if (resetToken) {
    return <ResetPassword token={resetToken} onComplete={handleResetComplete} />;
  }

  // 🎯 कंडीशन 2: सामान्य लॉगिन/डैशबोर्ड फ्लो
  return (
    <>
      {!user ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (!user.isPaid || currentView === 'profile') ? ( 
        // 🔒 अगर यूजर पेड नहीं है या प्रोफाइल व्यू पर है
        <Profile 
          user={user} 
          setUser={handleUserUpdateFromProfile} // यहाँ नया हैंडलर बिल्कुल सही काम करेगा
          onBack={() => {
            // बटन क्लिक पर लाइव ऑब्जेक्ट प्रॉपर्टी को चेक करें
            if (user && user.isPaid) {
              setCurrentView('dashboard');
            } else {
              alert("🛑 ट्रेनिंग शुरू करने के लिए कृपया पहले फीस का भुगतान करें।");
            }
          }} 
        />
      ) : (
        // 🟢 केवल पेड यूजर्स के लिए डैशबोर्ड
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