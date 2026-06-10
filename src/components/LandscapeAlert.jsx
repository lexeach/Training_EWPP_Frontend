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
    // 🌌 फुल स्क्रीन डार्क ओवरले - बिना किसी फ्लेक्सबॉक्स के परफेक्ट एब्सोल्यूट सेंटरिंग
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(15, 23, 42, 0.95)', // गहरा डार्क बैकग्राउंड
      zIndex: 99999999, // सबसे ऊपर रहेगा
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      
      {/* 🪙 मुख्य अलर्ट बॉक्स (पॉपअप विंडो) - प्योर गणितीय सेंटर पोजीशनिंग */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)', // 🎯 ये लाइन इसे स्क्रीन के डेड-सेंटर में रखेगी
        backgroundColor: '#1e293b', 
        color: '#ffffff',
        borderRadius: '16px',
        padding: '24px 20px',
        maxWidth: '290px',
        width: 'calc(100% - 40px)',
        border: '1px solid #334155', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        textAlign: 'center',
        boxSizing: 'border-box'
      }}>
        
        {/* 🔄 रोटेशन आइकॉन */}
        <div style={{
          backgroundColor: 'rgba(234, 179, 8, 0.1)',
          padding: '12px',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          margin: '0 auto 16px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '32px', height: '32px', color: '#eab308' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="2" width="14" height="20" rx="2" transform="rotate(90 12 12)" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5h.01M12 19h.01" />
          </svg>
        </div>

        {/* 📝 हेडिंग */}
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#eab308' }}>
          लैंडस्केप मोड की सलाह! 🔄
        </h3>
        
        {/* 📝 पैराग्राफ */}
        <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5', margin: '0 0 20px 0' }}>
          बेहतर व्यू, वीडियो देखने और ऑनलाइन टेस्ट को अच्छे से देने के लिए अपने मोबाइल को <strong>Landscape (घुमाकर)</strong> इस्तेमाल करें।
        </p>

        {/* 🤝 क्लोज बटन */}
        <button
          onClick={() => setShowPopup(false)}
          style={{
            width: '100%',
            backgroundColor: '#eab308', 
            color: '#0f172a', 
            fontWeight: 'bold',
            padding: '12px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          ठीक है, समझ गया 👍
        </button>

        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '12px' }}>
          (सुनिश्चित करें कि फोन का Auto-Rotate ऑन हो)
        </div>
      </div>
    </div>
  );
};

export default LandscapeAlert;
