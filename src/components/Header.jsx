// frontend/src/components/Header.jsx
import React from 'react';

// 🎯 ध्यान दें: यहाँ कर्ली ब्रेसेस {} के अंदर सभी प्रॉप्स का होना ज़रूरी है
export default function Header({ user, onLogout, onProfileClick, onTestListClick, onHomeClick }) {
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 30px',
      background: '#1e293b',
      color: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* 🏡 लोगो एरिया */}
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        onClick={onHomeClick || (() => window.location.reload())} 
      >
        <h2 style={{ margin: 0, color: '#38bdf8', fontSize: '22px' }}>EWPP Training</h2>
        <span style={{ fontSize: '12px', background: '#334155', padding: '3px 8px', borderRadius: '4px' }}>Portal</span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        {/* 📝 ऑनलाइन टेस्ट लिस्ट बटन */}
        <button 
          onClick={onTestListClick}
          style={{
            background: '#0284c7',
            color: '#fff',
            border: 'none',
            padding: '7px 16px',
            borderRadius: '4px',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer',
            transition: '0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseOver={(e) => e.target.style.background = '#0369a1'}
          onMouseOut={(e) => e.target.style.background = '#0284c7'}
        >
          📝 ऑनलाइन टेस्ट लिस्ट
        </button>

        {/* 👤 पार्टनर प्रोफाइल नाम */}
        <span 
          onClick={onProfileClick} // 👈 यहाँ यह एरर मार रहा था अगर ऊपर रिसीव नहीं हुआ था
          style={{ 
            fontSize: '15px', 
            cursor: 'pointer',
            padding: '5px 10px',
            borderRadius: '4px',
            transition: '0.2s',
            userSelect: 'none'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#334155'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          👤 पार्टनर: <strong>{user?.name || 'Gautam'}</strong>
        </span>
        
        {/* 🛑 लॉगआउट बटन */}
        <button 
          onClick={onLogout}
          style={{
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            padding: '6px 15px',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: '0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = '#dc2626'}
          onMouseOut={(e) => e.target.style.background = '#ef4444'}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
