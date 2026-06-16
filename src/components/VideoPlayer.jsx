import React, { useContext, useRef, useState, useEffect } from 'react';
import { ProgressContext } from '../context/ProgressContext';

export default function VideoPlayer({ onQuizStateChange, onQuizSubmitSuccess }) {
  const { 
    currentVideo, 
    updateProgressOnBackend, 
    submitQuizOnBackend, 
    modules, 
    setCurrentVideo,
    completedVideos, // Context से एक्सेस करें
    currentUnlockedVideo
  } = useContext(ProgressContext);
  
  const videoRef = useRef(null);
  const [maxTimeWatched, setMaxTimeWatched] = useState(0);
  const [secondsWatched, setSecondsWatched] = useState(0);
  const [isDriveVideoCompleted, setIsDriveVideoCompleted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizData, setQuizData] = useState([]);
  const [isBuffering, setIsBuffering] = useState(false);

  const isGoogleDrive = currentVideo?.url?.includes('google.com') || currentVideo?.url?.includes('drive.google.com');
  const DRIVE_REQUIRED_TIME = 15; 

  // 🟢 सुरक्षा लेयर: क्या वीडियो लॉक्ड है?
  const isVideoLocked = () => {
    if (!currentVideo) return true;
    // लॉजिक Sidebar.jsx से मैच करें
    if (currentVideo.videoId === "m1s1-v1") return false;
    if (completedVideos.includes(currentVideo.videoId)) return false;
    if (currentUnlockedVideo === currentVideo.videoId) return false;
    return true;
  };

  useEffect(() => {
    if (onQuizStateChange) onQuizStateChange(showQuiz);
  }, [showQuiz, onQuizStateChange]);

  useEffect(() => {
    setSecondsWatched(0);
    setIsDriveVideoCompleted(false);
    setShowQuiz(false);
    setSelectedAnswers({});
  }, [currentVideo?.videoId]);

  // 🟢 [सुधार]: handleVideoEnded अब ऑटो-प्ले नहीं करेगा
  const handleVideoEnded = async () => {
    alert("🎉 आपने वीडियो पूरा देख लिया है! प्रोग्रेस अपडेट हो रही है...");
    const result = await updateProgressOnBackend(currentVideo.videoId);
    
    if (result) {
      if (currentVideo.quiz && Array.isArray(currentVideo.quiz) && currentVideo.quiz.length > 0) {
        setQuizData(currentVideo.quiz);
        setShowQuiz(true);
      } else {
        // अगर क्विज़ नहीं है, तो बस एक मैसेज दिखाएं, अगले वीडियो पर न भेजें (User-defined requirement)
        alert("✅ प्रोग्रेस सेव हो गई है। आप अगले वीडियो पर जा सकते हैं।");
      }
    }
  };

  const handleQuizSubmit = async () => {
    const totalQuestions = quizData.length;
    if (Object.keys(selectedAnswers).length < totalQuestions) {
      alert("🛑 कृपया असेसमेंट सबमिट करने से पहले सभी प्रश्नों के उत्तर चुनें।");
      return;
    }
    const answersArray = quizData.map((_, index) => selectedAnswers[index]);
    
    try {
      const result = await submitQuizOnBackend(currentVideo.videoId, answersArray);
      if (result) {
        if (result.passed) {
          alert(`🎉 बधाई हो! आप पास हो गए!`);
          if (onQuizSubmitSuccess) onQuizSubmitSuccess(result.quizResults);
          await updateProgressOnBackend(currentVideo.videoId);
          setShowQuiz(false);
          // अब टेस्ट पास होने पर ही नेक्स्ट वीडियो चलेगा
          // handleNextVideoSwitch(); // इसे यहाँ से हटा दिया है ताकि आप मैन्युअली कंट्रोल कर सकें
        } else {
          alert(`❌ टेस्ट फेल हो गया। कृपया दोबारा प्रयास करें।`);
          if (onQuizSubmitSuccess) onQuizSubmitSuccess(result.quizResults);
          setShowQuiz(false);
          if (videoRef.current) videoRef.current.currentTime = 0;
        }
      }
    } catch (err) {
      alert("🛑 तकनीकी त्रुटि आई है।");
    }
  };

  if (!currentVideo) return <div style={{ padding: '40px', textAlign: 'center' }}>लोड हो रहा है...</div>;

  // 🟢 रेंडर से पहले लॉक चेक
  if (isVideoLocked()) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000', color: '#fff' }}>
        <h2>🔒 वीडियो लॉक है। कृपया पिछला टेस्ट पास करें।</h2>
      </div>
    );
  }

  return (
    // ... आपका बाकी रेंडर कोड (Video/Iframe) वैसा ही रहेगा
    <div style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc' }}>
      {/* ... (Video Player UI code stays here) ... */}
    </div>
  );
}
