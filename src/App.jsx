// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Profile from './views/Profile';
import ResetPassword from './views/ResetPassword';
import axios from 'axios'; // 💡 लेटेस्ट पेमेंट स्टेटस मंगाने के लिए

function App() {
  // लोकलस्टोरेज से यूजर का शुरुआती सेशन निकालना
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('partnerUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' या 'profile'
  const [resetToken, setResetToken] = useState(null);

  // 🚀 1. लाइव पेमेंट स्टेटस चेक (Every Time App Loads / Refreshes)
  // 🚀 1. लाइव पेमेंट स्टेटस चेक (App.jsx के अंदर का useEffect)
useEffect(() => {
  const checkLivePaymentStatus = async () => {
    if (user && user.email) {
      try {
        console.log("[APP] सर्वर से यूजर का लेटेस्ट पेमेंट स्टेटस मंगाया जा रहा है...");
        
        // 💡 सही एंडपॉइंट पाथ: auth-utils/get-profile
        const res = await axios.post("https://training-ewpp-backend.onrender.com/api/auth-utils/get-profile", { email: user.email });
        
        if (res.data && res.data.success) {
          const freshUserData = res.data.user;
          console.log("[APP SUCCESS] सर्वर से मिला लेटेस्ट isPaid स्टेटस:", freshUserData.isPaid);
          
          setUser(freshUserData);
          localStorage.setItem('partnerUser', JSON.stringify(freshUserData));
        }
      } catch (error) {
        console.error("[APP ERROR] लेटेस्ट पेमेंट स्टेटस सिंक करने में विफल:", error.message);
      }
    }
  };

  checkLivePaymentStatus();
}, []);
// यह ऐप के बिल्कुल शुरुआती लोड पर चलेगा

  // 🚀 2. पासवर्ड रीसेट टोकन चेक (पुराना वर्किंग लॉजिक)
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('resetToken');
    if (token) {
      setResetToken(token);
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('partnerUser', JSON.stringify(userData));
    
    // अगर यूजर ने पेमेंट नहीं किया है, तो सीधे प्रोफाइल (Payment Screen) पर भेजें
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
    window.history.pushState({}, document.title, "/"); 
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
        // 🔒 अगर यूजर ने पे नहीं किया है या वो प्रोफाइल देखना चाहता है
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
        // 🟢 केवल पेड (Paid) यूजर्स ही डैशबोर्ड देख पाएंगे
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