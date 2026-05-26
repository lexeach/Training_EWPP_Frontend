// frontend/src/components/Header.jsx
import React from 'react';

export default function Header({ user, onLogout }) {
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h2 style={{ margin: 0, color: '#38bdf8', fontSize: '22px' }}>EWPP Training</h2>
        <span style={{ fontSize: '12px', background: '#334155', padding: '3px 8px', borderRadius: '4px' }}>Portal</span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span style={{ fontSize: '15px' }}>👤 पार्टनर: <strong>{user?.name}</strong></span>
        <button 
          onClick={onLogout}
          style={{
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            padding: '6px 15px',
            borderRadius: '4px',
            fontWeight: 'bold',
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