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
    const savedUser = localStorage.getItem('partnerUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' या 'profile'
  const [resetToken, setResetToken] = useState(null);
  const [hasSynced, setHasSynced] = useState(false);

  // 🚀 पासवर्ड रीसेट टोकन चेक
  useEffect(() => {
    if (window.location.pathname.includes('/reset-password/')) {
      const parts = window.location.pathname.split('/');
      const token = parts[parts.length - 1];
      if (token) {
        setResetToken(token);
      }
    }
  }, []);

  // 🚀 लाइव पेमेंट स्टेटस सिंक (केवल शुरुआती लोड पर काम करेगा, पेमेंट फ्लो को डिस्टर्ब नहीं करेगा)
  useEffect(() => {
    const checkLivePaymentStatus = async () => {
      if (user && user.email && !hasSynced && !user.isPaid) {
        try {
          console.log("[APP] सर्वर से लाइव पेमेंट स्टेटस वेरीफाई किया जा रहा है...");
          const res = await axios.post("https://training-ewpp-backend.onrender.com/api/auth-utils/get-profile", { email: user.email });
          
          if (res.data && res.data.success) {
            const freshUserData = res.data.user;
            if (freshUserData.isPaid) {
              setUser(freshUserData);
              localStorage.setItem('partnerUser', JSON.stringify(freshUserData));
              setCurrentView('dashboard');
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
    window.location.href = "/";
  };

  // 💡 मुख्य सुधार: जब प्रोफाइल से यूजर डेटा अपडेट होगा, तो व्यू भी तुरंत बदल जाएगा
  const handleUserUpdateFromProfile = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('partnerUser', JSON.stringify(updatedUserData));
    if (updatedUserData.isPaid) {
      setCurrentView('dashboard'); // 🚀 तुरंत डैशबोर्ड व्यू एक्टिव करें
    }
  };

  if (resetToken) {
    return <ResetPassword token={resetToken} onComplete={handleResetComplete} />;
  }

  return (
    <>
      {!user ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (!user.isPaid) ? (
        // 🔒 अगर यूजर ने पे नहीं किया है, तो उसे केवल प्रोफाइल/पेमेंट स्क्रीन दिखेगी
        <Profile 
          user={user} 
          setUser={handleUserUpdateFromProfile} // 💡 यहाँ अपना नया हैंडलर पास किया
          onBack={() => {
            alert("🛑 ट्रेनिंग शुरू करने के लिए कृपया पहले फीस का भुगतान करें।");
          }} 
        />
      ) : (
        // 🟢 पेड (Paid) यूजर्स या 'dashboard' व्यू के लिए
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