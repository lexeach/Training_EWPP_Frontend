// frontend/src/components/Header.jsx
import React from 'react';

export default function Header({ 
  user, 
  onLogout, 
  onProfileClick, 
  onTestListClick, 
  onHomeClick,
  isQuizActive, 
  onBackFromQuiz,
  isMobile // 🟢 यह प्रोप डैशबोर्ड से रिसीव करें
}) {
  
  // मोबाइल पर वर्टिकल और डेस्कटॉप पर हॉरिजॉन्टल लेआउट
  const headerStyle = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isMobile ? '10px' : '10px 30px',
    background: '#1e293b',
    color: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    gap: isMobile ? '10px' : '20px',
    width: '100%',
    boxSizing: 'border-box'
  };

  return (
    <header style={headerStyle}>
      {/* 🏡 लोगो एरिया */}
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'center' : 'flex-start' }}
        onClick={!isQuizActive ? (onHomeClick || (() => window.location.reload())) : undefined} 
      >
        <h2 style={{ margin: 0, color: '#38bdf8', fontSize: '20px' }}>EWPP Training</h2>
        {!isMobile && <span style={{ fontSize: '12px', background: '#334155', padding: '3px 8px', borderRadius: '4px' }}>Portal</span>}
      </div>
      
      {/* ⚙️ बटन्स एरिया */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: isMobile ? '10px' : '20px', 
        width: isMobile ? '100%' : 'auto',
        justifyContent: isMobile ? 'space-between' : 'flex-end',
        flexWrap: 'wrap' // 🟢 ताकि बटन अगली लाइन में आ सकें अगर जगह कम हो
      }}>
        
        {isQuizActive ? (
          <button
            onClick={onBackFromQuiz}
            style={{
              background: '#eab308', color: '#0f172a', border: 'none', padding: '8px 12px', 
              borderRadius: '4px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer'
            }}
          >
            ◀️ वापस कोर्स पर जाएँ
          </button>
        ) : (
          <>
            <button 
              onClick={onTestListClick}
              style={{
                background: '#0284c7', color: '#fff', border: 'none', padding: '7px 12px', 
                borderRadius: '4px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer'
              }}
            >
              {isMobile ? '📝 टेस्ट' : '📝 ऑनलाइन टेस्ट लिस्ट'}
            </button>

            <span 
              onClick={onProfileClick}
              style={{ fontSize: '14px', cursor: 'pointer', padding: '5px', borderRadius: '4px' }}
            >
              👤 {isMobile ? '' : <>पार्टनर: <strong>{user?.name || 'Gautam'}</strong></>}
            </span>
            
            <button 
              onClick={onLogout}
              style={{
                background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', 
                borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px'
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}
