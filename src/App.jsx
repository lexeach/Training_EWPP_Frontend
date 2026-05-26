// frontend/src/App.jsx
import React, { useState } from 'react';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Profile from './views/Profile';

function App() {
  // लोकलस्टोरेज से यूजर का सेशन और पेमेंट स्टेटस निकालना
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('partnerUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' या 'profile'

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