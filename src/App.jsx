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

  // 💡 सुधार: अगर यूजर लॉगिन है और पेड है तो सीधे 'dashboard' पर जाए, वरना 'profile' पर रुके
  const [currentView, setCurrentView] = useState(() => {
    const savedUser = localStorage.getItem('partnerUser');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      return parsed.isPaid ? 'dashboard' : 'profile';
    }
    return 'dashboard';
  });

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

  // 🚀 लाइव पेमेंट स्टेटस सिंक (केवल शुरुआती फ्रेश लोड पर काम करेगा)
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
              setCurrentView('dashboard'); // लाइव डेटाबेस में एक्टिव मिलते ही डैशबोर्ड खोलें
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

  // 💡 जादूई हैंडलर: प्रोफाइल से पेमेंट सक्सेस होने पर यह तुरंत व्यू को बदल देगा
  const handleUserUpdateFromProfile = (updatedUserData) => {
    console.log("[APP] प्रोफाइल से लाइव डेटा अपडेट मिला:", updatedUserData);
    setUser(updatedUserData);
    localStorage.setItem('partnerUser', JSON.stringify(updatedUserData));
    
    if (updatedUserData.isPaid) {
      setCurrentView('dashboard'); // 🚀 बिल्कुल सुरक्षित तरीके से सीधे डैशबोर्ड पर भेजें
    }
  };

  if (resetToken) {
    return <ResetPassword token={resetToken} onComplete={handleResetComplete} />;
  }

  return (
    <>
      {!user ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (currentView === 'profile') ? ( // 💡 अब रेंडरिंग का फैसला सिर्फ 'currentView' स्टेट करेगी, user.isPaid की असिंक्रोनस रेस कंडीशन यहाँ खत्म!
        <Profile 
          user={user} 
          setUser={handleUserUpdateFromProfile} 
          onBack={() => {
            // अगर यूजर वाकई पेड हो चुका है, तो उसे जाने दें
            if (user.isPaid || JSON.parse(localStorage.getItem('partnerUser'))?.isPaid) {
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