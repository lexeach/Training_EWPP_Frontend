// frontend/src/App.jsx
import React, { useState } from 'react';
import Login from './views/Login';
import Dashboard from './views/Dashboard';

function App() {
  // लोकलस्टोरेज से यूजर का पुराना सेशन चेक करना
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('partnerUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // लॉगिन सफल होने पर स्टेट और लोकलस्टोरेज अपडेट करना
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('partnerUser', JSON.stringify(userData));
  };

  // लॉगआउट करने पर सेशन क्लियर करना
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('partnerUser');
  };

  return (
    <>
      {!user ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Dashboard user={user} setUser={setUser} onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;