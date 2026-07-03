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
  isMobile 
}) {
  
  return (
    <header style={{
      display: 'flex',
      flexDirection: 'column', // 🟢 हमेशा कॉलम ताकि EWPP ऊपर रहे
      padding: '10px',
      background: '#1e293b',
      color: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      gap: '10px',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* 🏡 लोगो एरिया */}
      <div 
        style={{ textAlign: 'center', cursor: 'pointer', width: '100%' }}
        onClick={!isQuizActive ? (onHomeClick || (() => window.location.reload())) : undefined} 
      >
        <h2 style={{ margin: 0, color: '#38bdf8', fontSize: '22px' }}>EWPP Training</h2>
      </div>
      
      {/* ⚙️ बटन्स एरिया (मोबाइल पर एक लाइन में) */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', // 🟢 सभी बटन सेंटर में एक लाइन में
        gap: '8px', 
        width: '100%',
        flexWrap: 'wrap' 
      }}>
        
        {isQuizActive ? (
          <button
            onClick={onBackFromQuiz}
            style={{
              background: '#eab308', color: '#0f172a', border: 'none', padding: '8px 12px', 
              borderRadius: '4px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer'
            }}
          >
            ◀️ GO BACK
          </button>
        ) : (
          <>
            <button 
              onClick={onTestListClick}
              style={{
                background: '#0284c7', color: '#fff', border: 'none', padding: '7px 10px', 
                borderRadius: '4px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer'
              }}
            >
              {isMobile ? '📝 टेस्ट' : '📝 Online test list'}
            </button>

            <button 
              onClick={onProfileClick}
              style={{
                background: '#58038a', color: '#fff', border: 'none', padding: '7px 10px', 
                borderRadius: '4px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer'
              }}
            >
              👤 {isMobile ? user?.name?.split(' ')[0] : <>PROFILE: <strong>{user?.name || 'Gautam'}</strong></>}
            </button>
            
            <button 
              onClick={onLogout}
              style={{
                background: '#ef4444', color: '#fff', border: 'none', padding: '7px 10px', 
                borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px'
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
