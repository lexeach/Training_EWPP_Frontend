// frontend/src/components/VideoPlayer.jsx
import React, { useContext, useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { ProgressContext } from '../context/ProgressContext';

export default function VideoPlayer({ onQuizStateChange, onQuizSubmitSuccess }) {
  const { 
    currentVideo, 
    updateProgressOnBackend, 
    submitQuizOnBackend, 
    modules, 
    setCurrentVideo 
  } = useContext(ProgressContext);
  
  const videoRef = useRef(null);
  const [maxTimeWatched, setMaxTimeWatched] = useState(0);
  const [secondsWatched, setSecondsWatched] = useState(0);
  const [isDriveVideoCompleted, setIsDriveVideoCompleted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizData, setQuizData] = useState([]);
  const [isBuffering, setIsBuffering] = useState(false);
  
  // 🟢 Access control states
  const [hasAccess, setHasAccess] = useState(null); 
  const BACKEND_URL = "https://training-ewpp-backend.onrender.com/api";

  const isGoogleDrive = currentVideo?.url?.includes('google.com') || currentVideo?.url?.includes('drive.google.com');
  const DRIVE_REQUIRED_TIME = 15; 

  // 🟢 [ACCESS CHECK]
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

  // 📢 [FIXED] जब भी स्थानीय 'showQuiz' स्टेट बदलेगी, यह तुरंत पैरेंट को रिपोर्ट करेगा
  useEffect(() => {
    if (onQuizStateChange) {
      onQuizStateChange(showQuiz);
    }
  }, [showQuiz, onQuizStateChange]);

  // वीडियो बदलते ही पुरानी स्टेट साफ करें
  useEffect(() => {
    setMaxTimeWatched(0);
    setSecondsWatched(0);
    setIsDriveVideoCompleted(false);
    setShowQuiz(false);
    setSelectedAnswers({});
    setQuizData([]);
    setIsBuffering(false);
  }, [currentVideo?.videoId]);

  // 📝 टेस्ट लिस्ट से मैनुअल रिक्वेस्ट आने पर सेफ सिंकिंग
  useEffect(() => {
    const shouldStartQuiz = localStorage.getItem('autoStartQuiz');
    if (shouldStartQuiz === 'true' && currentVideo?.quiz && Array.isArray(currentVideo.quiz) && currentVideo.quiz.length > 0) {
      localStorage.removeItem('autoStartQuiz'); 
      setQuizData(currentVideo.quiz);
      setShowQuiz(true);
    }
  }, [currentVideo]);

  // गूगल ड्राइव टाइमर
  useEffect(() => {
    let interval = null;
    if (currentVideo && isGoogleDrive && !isDriveVideoCompleted && !showQuiz) {
      interval = setInterval(() => {
        setSecondsWatched((prev) => {
          if (prev + 1 >= DRIVE_REQUIRED_TIME) {
            setIsDriveVideoCompleted(true);
            clearInterval(interval);
            return DRIVE_REQUIRED_TIME;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [currentVideo?.videoId, isGoogleDrive, isDriveVideoCompleted, showQuiz]);

  // 🟢 UI Protection Check
  if (hasAccess === null) return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>लोड हो रहा है...</div>;

  if (hasAccess === false) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '8px', margin: '20px' }}>
        <h2 style={{ color: '#e11d48' }}>🔒 यह वीडियो पेड है</h2>
        <p>इस वीडियो और पूरे कोर्स को अनलॉक करने के लिए कृपया पेमेंट करें।</p>
        <button onClick={() => window.location.href = '/profile'} style={{ padding: '10px 20px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          अभी पेमेंट करें
        </button>
      </div>
    );
  }

  // --- पुराने फंक्शन्स (handleTimeUpdate, handleQuizSubmit, आदि) यहाँ वैसे ही रहने दें ---
  
  // (नोट: आपकी फाइल में जो 'handleTimeUpdate', 'handleVideoEnded', 'handleQuizSubmit' फंक्शन्स थे, 
  // वे यहाँ इसके नीचे आ जाएंगे।)

  if (!currentVideo) return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>लोड हो रहा है...</div>;

  // ... (बाकी सारा कोड यहाँ पेस्ट कर दें)
  return (
    <div style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc' }}>
      {/* आपका पुराना रेंडर कोड यहाँ... */}
    </div>
  );
}
