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
  const [hasSynced, setHasSynced] = useState(false); // 💡 स्टेट्स के साथ सही जगह सेट किया

  // 🚀 1. लाइव पेमेंट स्टेटस चेक (केवल ऐप के एकदम शुरुआती फ्रेश लोड/रीफ्रेश पर काम करेगा)
  useEffect(() => {
    const checkLivePaymentStatus = async () => {
      // अगर यूजर लॉगिन है और इस सेशन में डेटाबेस से सिंक नहीं हुआ है
      if (user && user.email && !hasSynced) {
        try {
          console.log("[APP] सर्वर से लाइव पेमेंट स्टेटस वेरीफाई किया जा रहा है...");
          const res = await axios.post("https://training-ewpp-backend.onrender.com/api/auth-utils/get-profile", { email: user.email });
          
          if (res.data && res.data.success) {
            const freshUserData = res.data.user;
            console.log("[APP SUCCESS] सर्वर से मिला लाइव स्टेटस:", freshUserData.isPaid);
            
            // 💡 केवल तभी सिंक करेंगे जब डेटाबेस में स्थिति बदल चुकी हो, ताकि रेस कंडीशन न बने
            if (freshUserData.isPaid !== user.isPaid) {
              setUser(freshUserData);
              localStorage.setItem('partnerUser', JSON.stringify(freshUserData));
            }
          }
        } catch (error) {
          console.error("[APP ERROR] लाइव स्टेटस सिंक फेल:", error.message);
        } finally {
          setHasSynced(true); // सिंक का प्रयास पूरा हुआ, अब दोबारा लूप नहीं चलेगा
        }
      }
    };

    checkLivePaymentStatus();
  }, [hasSynced]); // 💡 डिपेंडेंसी से 'user' हटाया ताकि बेवजह बार-बार एपीआई हिट न हो

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
    setHasSynced(false); // 💡 नए लॉगिन पर दोबारा सिंक की अनुमति दें
    
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
    setHasSynced(false);
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

  // 🎯 Condition 2: Normal Login / Dashboard Flow
  return (
    <>
      {!user ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (!user.isPaid || currentView === 'profile') ? (
        // 🔒 अगर यूजर ने पे नहीं किया है या वो प्रोफाइल देखना चाहता है
        <Profile 
          user={user} 
          setUser={setUser} // 🚀 सबसे बड़ी गड़बड़ यही थी, इसे अब पास कर दिया है!
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