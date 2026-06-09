// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Profile from './views/Profile';
import ResetPassword from './views/ResetPassword';
import axios from 'axios';
import AdminPanel from './views/AdminPanel'; 
import TestListPage from './pages/TestListPage'; // 🟢 नया टेस्ट लिस्ट पेज इम्पोर्ट किया

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
        // 🔒 अगर यूजर पेड नहीं है या प्रोफाइल व्यू पर है
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
      ) : currentView === 'tests' ? (
        // 📝 🎯 नई कंडीशन: अगर यूजर ने 'ऑनलाइन टेस्ट लिस्ट' बटन पर क्लिक किया है
        <TestListPage 
          user={user} 
          onBack={() => setCurrentView('dashboard')} // वापस डैशबोर्ड व्यू पर जाने के लिए
        />
      ) : (
        // 🟢 केवल पेड यूजर्स के लिए मुख्य डैशबोर्ड व्यू
        <Dashboard 
          user={user} 
          setUser={setUser} 
          onLogout={handleLogout} 
          onProfileClick={() => setCurrentView('profile')} 
          onTestListClick={() => setCurrentView('tests')} // 👈 हेडर के नए बटन को कंट्रोल करने के लिए पास किया
        />
      )}
    </>
  );
}

export default App;
