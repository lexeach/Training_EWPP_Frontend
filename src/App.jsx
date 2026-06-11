// frontend/src/App.jsx
import LandscapeAlert from './components/LandscapeAlert'; // 🎯 अलर्ट इम्पोर्ट किया गया
import React, { useState, useEffect } from 'react';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Profile from './views/Profile';
import ResetPassword from './views/ResetPassword';
import axios from 'axios';
import AdminPanel from './views/AdminPanel'; 
import TestListPage from './views/TestListPage'; // 🟢 टेस्ट लिस्ट पेज इम्पोर्टेड

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

  // 💡 शुरुआत में इसे हमेशा 'dashboard' रखें
  const [currentView, setCurrentView] = useState('dashboard'); 
  const [resetToken, setResetToken] = useState(null);
  const [hasSynced, setHasSynced] = useState(false);
  
  // 🎯 एडमिन मोड को ट्रैक करने के लिए एक नई स्टेट
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  // 🚀 1. पासवर्ड रीसेट टोकन और /admin URL पाथ चेक
  useEffect(() => {
    const currentPath = window.location.pathname;

    // अगर ब्राउज़र के URL में /admin लिखा है तो सीधे एडमिन मोड ऑन करें
    if (currentPath === '/admin' || currentPath === '/admin/') {
      setIsAdminRoute(true);
    }

    if (currentPath.includes('/reset-password/')) {
      const parts = currentPath.split('/');
      const token = parts[parts.length - 1];
      if (token) {
        setResetToken(token);
      }
    }
  }, []);

  // 🚀 [मास्टर फिक्स] हार्ड रिफ्रेश या री-डेप्लॉय होने पर डेटाबेस से लाइव यूज़र डेटा सिंक करना
  useEffect(() => {
    const fetchFreshUserOnLoad = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem('token'); // लॉगइन के समय सेव किया गया JWT टोकन
        if (token) {
          console.log("[APP] डेटाबेस से ताजा प्रोफाइल डेटा सिंक किया जा रहा है...");
          const res = await axios.get('https://training-ewpp-backend.onrender.com/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (res.data && res.data.success && res.data.user) {
            const freshUserData = res.data.user;
            setUser(freshUserData);
            localStorage.setItem('partnerUser', JSON.stringify(freshUserData));
          }
        }
      } catch (err) {
        console.error("[APP ERROR] ताज़ा यूज़र डेटा सिंक फेल:", err.message);
      }
    };

    fetchFreshUserOnLoad();
  }, []); // खाली एरे ताकि यह सिर्फ ऐप के इनिशियल लोड/रिफ्रेश पर एक बार चले

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

  // 🎯 एडमिन पैनल से "← वापस जाएँ" बटन दबाने पर हैंडलर
  const handleAdminBack = () => {
    setIsAdminRoute(false);
    window.history.pushState({}, document.title, "/"); // URL बार को वापस साफ़ करके '/' कर देगा
  };

  // 🛡️ ग्लोबल रेंडर फंक्शन: यह सुनिश्चित करता है कि LandscapeAlert हमेशा सबसे ऊपर चले, चाहे कोई भी स्क्रीन लोड हो
  const renderMainContent = () => {
    // 🎯 कंडीशन 1: पासवर्ड रीसेट स्क्रीन
    if (resetToken) {
      return <ResetPassword token={resetToken} onComplete={handleResetComplete} />;
    }

    // 🎯 CONDITION 2: अगर एडमिन ने ब्राउज़र में /admin टाइप किया है
    if (isAdminRoute) {
      return <AdminPanel onBack={handleAdminBack} />;
    }

    // 🎯 CONDITION 3: सामान्य लॉगिन/डैशबोर्ड फ्लो
    return (
      <>
        {!user ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (!user.isPaid || currentView === 'profile') ? ( 
          <Profile 
            user={user} 
            setUser={handleUserUpdateFromProfile} 
            onBack={() => {
              if (user && user.isPaid) {
                setCurrentView('dashboard');
              } else {
                alert("🛑 ट्रेनिंग शुरू करने के लिए कृपया पहले FEES का भुगतान करें।");
              }
            }} 
          />
        ) : (
          // 🟢 यहाँ सीधे Dashboard लोड होगा और हम 'currentView' को नीचे भेज देंगे
          <Dashboard 
            user={user} 
            setUser={setUser} 
            onLogout={handleLogout} 
            onProfileClick={() => setCurrentView('profile')} 
          />
        )}
      </>
    );
  };

  return (
    <>
       {/* ✨ मास्टर फिक्स: यह अलर्ट हर स्क्रीन (Login, Dashboard, Admin) पर मोबाइल पोर्ट्रेट को ब्लॉक करेगा */}
      <LandscapeAlert />
      
       {/* बाकी का डायनामिक कंटेंट रेंडर होगा */}
      {renderMainContent()}
    </>
  );
}

export default App;
