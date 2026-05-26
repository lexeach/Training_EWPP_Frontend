// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Profile from './views/Profile';
import ResetPassword from './views/ResetPassword'; // 💡 नया कंपोनेंट इम्पोर्ट किया

function App() {
  // लोकलस्टोरेज से यूजर का सेशन और पेमेंट स्टेटस निकालना
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('partnerUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' या 'profile'
  
  // 💡 पासवर्ड रीसेट फ्लो को बिना राउटर के यूआरएल से ट्रैक करने के लिए स्टेट्स
  const [resetToken, setResetToken] = useState(null);

  useEffect(() => {
    // ऐप लोड होते ही चेक करो कि क्या URL में '/reset-password/' है
    const path = window.location.pathname;
    if (path.startsWith('/reset-password/')) {
      const token = path.split('/reset-password/')[1];
      if (token) {
        setResetToken(token); // टोकन मिलते ही उसे स्टेट में रख लो
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('partnerUser', JSON.stringify(userData));
    
    // 💡 अगर यूजर ने पेमेंट नहीं किया है, तो लॉगिन होते ही सीधे प्रोफाइल (Payment Screen) पर भेजें
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
    // यूआरएल को साफ करके वापस क्लीन डोमेन बना देना (बिना पेज रीलोड किए)
    window.history.pushState({}, document.title, "/"); 
  };

  // 🎯 कंडीशन 1: अगर यूआरएल में रीसेट टोकन मिला है, तो सबसे पहले नया पासवर्ड सेट करने की स्क्रीन दिखाओ
  if (resetToken) {
    return <ResetPassword token={resetToken} onComplete={handleResetComplete} />;
  }

  // 🎯 कंडीशन 2: सामान्य फ्लो (जो आपका पुराना था)
  return (
    <>
      {!user ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (!user.isPaid || currentView === 'profile') ? (
        // 🔒 अगर यूजर ने पे नहीं किया है या वो प्रोफाइल देखना चाहता है, तो प्रोफाइल स्क्रीन दिखेगी
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