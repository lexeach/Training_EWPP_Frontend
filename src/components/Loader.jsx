// frontend/src/components/Loader.jsx
import React from 'react';

export default function Loader({ message = "प्रोसेसिंग चल रही है, कृपया प्रतीक्षा करें..." }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(15, 23, 42, 0.6)', // डार्क ट्रांसपेरेंट बैकग्राउंड
      backdropFilter: 'blur(4px)', // स्क्रीन हल्की सी ब्लर हो जाएगी
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 99999, // सबसे ऊपर रहेगा ताकि कोई क्लिक न कर पाए
      color: '#fff',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* 🌀 खूबसूरत CSS स्पिनर */}
      <div style={{
        width: '50px',
        height: '50px',
        border: '5px solid #f3f3f3',
        borderTop: '5px solid #0284c7', // Exowa ब्लू थीम कलर
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      
      <p style={{ marginTop: '20px', fontSize: '16px', fontWeight: '600', letterSpacing: '0.5px' }}>
        {message}
      </p>

      {/* स्पिनर एनिमेशन के लिए स्टाइल टैग */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
