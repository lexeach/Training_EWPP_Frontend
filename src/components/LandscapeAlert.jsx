import React, { useState, useEffect } from 'react';

const LandscapeAlert = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      const isPortraitMode = window.matchMedia("(orientation: portrait)").matches;
      
      if (isMobile && isPortraitMode) {
        setShowPopup(true);
      } else {
        setShowPopup(false); 
      }
    };

    checkOrientation();

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!showPopup) return null;

  return (
    // 🌌 1. प्योर इनलाइन ब्लैक ओवरले - यह पूरी स्क्रीन को घेरेगा और सब कुछ इसके पीछे धुंधला रहेगा
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(15, 23, 42, 0.95)', // गहरा डार्क बैकग्राउंड
      zIndex: 9999999, // ब्रह्मांड का सबसे बड़ा Z-Index ताकि कोई इसके ऊपर न आ सके
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      
      {/* 🪙 2. मुख्य अलर्ट बॉक्स (पॉपअप विंडो) - यह स्क्रीन के ठीक बीचों-बीच रहेगा */}
      <div style={{
        backgroundColor: '#1e293b', // slate-800
        color: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '320px',
        width: '100%',
        border: '1px solid #334155', // slate-700
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxSizing: 'border-box'
      }}>
        
        {/* 🔄 एनिमेटेड रोटेशन आइकॉन */}
        <div style={{
          backgroundColor: 'rgba(234, 179, 8, 0.1)',
          padding: '12px',
          borderRadius: '50%',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '40px', height: '40px', color: '#eab308' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="2" width="14" height="20" rx="2" transform="rotate(90 12 12)" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5h.01M12 19h.01" />
          </svg>
        </div>

        {/* 📝 टेक्स्ट */}
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#eab308', letterSpacing: '0.5px' }}>
          लैंडस्केप मोड की सलाह! 🔄
        </h3>
        
        <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '20px', margin: '0 0 20px 0' }}>
          बेहतर व्यू, वीडियो देखने और ऑनलाइन टेस्ट को अच्छे से देने के लिए अपने मोबाइल को <strong>Landscape (घुमाकर)</strong> इस्तेमाल करना सबसे बेस्ट रहता है।
        </p>

        {/* 🤝 ठीक है बटन */}
        <button
          onClick={() => setShowPopup(false)}
          style={{
            width: '100%',
            backgroundColor: '#eab308', // yellow-500
            color: '#0f172a', // slate-900
            fontWeight: 'bold',
            padding: '12px 20px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'background-color 0.2s',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#ca8a04'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#eab308'}
        >
          ठीक है, समझ गया 👍
        </button>

        <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '12px' }}>
          (सुनिश्चित करें कि फोन का Auto-Rotate ऑन हो)
        </span>
      </div>
    </div>
  );
};

export default LandscapeAlert;
