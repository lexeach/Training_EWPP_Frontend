import React, { useContext, useRef, useState, useEffect } from 'react';
import axios from 'axios'; // axios को इम्पोर्ट करें
import { ProgressContext } from '../context/ProgressContext';

export default function VideoPlayer({ onQuizStateChange, onQuizSubmitSuccess }) {
  const { 
    currentVideo, 
    updateProgressOnBackend, 
    submitQuizOnBackend, 
    modules, 
    setCurrentVideo 
  } = useContext(ProgressContext);
  
  // 🟢 Access control states
  const [hasAccess, setHasAccess] = useState(null); 
  const BACKEND_URL = "https://training-ewpp-backend.onrender.com/api";

  // 🟢 [ACCESS CHECK] वीडियो लोड होते ही एक्सेस चेक करें
  useEffect(() => {
    const verifyAccess = async () => {
      if (!currentVideo?.videoId) return;
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${BACKEND_URL}/video-access/${currentVideo.videoId}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setHasAccess(res.data.access);
      } catch (err) {
        setHasAccess(false);
      }
    };
    verifyAccess();
  }, [currentVideo?.videoId]);

  // ... (बाकी आपका पुराना कोड यहाँ वैसा ही रहेगा) ...

  // 🟢 UI के अंदर रेंडरिंग से पहले एक्सेस चेक का लॉजिक
  if (hasAccess === false) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '8px', margin: '20px' }}>
        <h2 style={{ color: '#e11d48' }}>🔒 यह वीडियो पेड है</h2>
        <p>इस वीडियो और पूरे कोर्स को अनलॉक करने के लिए कृपया पेमेंट करें।</p>
        <button onClick={() => window.location.href = '/profile'} style={{ padding: '10px 20px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          अभी पेमेंट करें (₹350)
        </button>
      </div>
    );
  }

  if (hasAccess === null) return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>एक्सेस वेरीफाई हो रहा है...</div>;

  // ... [आपका पुराना return (वीडियो प्लेयर का HTML) यहाँ से शुरू होगा] ...
