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
  
  // 🟢 Access Control State
  const [hasAccess, setHasAccess] = useState(null);
  const BACKEND_URL = "https://training-ewpp-backend.onrender.com/api";

  const isGoogleDrive = currentVideo?.url?.includes('google.com') || currentVideo?.url?.includes('drive.google.com');
  const DRIVE_REQUIRED_TIME = 15;

  // 🟢 [ACCESS CHECK EFFECT]
  useEffect(() => {
    const verifyAccess = async () => {
      if (!currentVideo?.videoId) return;

      // 🟢 Hardcoded Check: Agar sequenceOrder 1, 2, ya 3 hai, toh access true de dein
      if (currentVideo.sequenceOrder <= 3) {
        setHasAccess(true);
        return;
      }

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

  useEffect(() => {
    if (onQuizStateChange) onQuizStateChange(showQuiz);
  }, [showQuiz, onQuizStateChange]);

  useEffect(() => {
    setMaxTimeWatched(0);
    setSecondsWatched(0);
    setIsDriveVideoCompleted(false);
    setShowQuiz(false);
    setSelectedAnswers({});
    setQuizData([]);
    setIsBuffering(false);
  }, [currentVideo?.videoId]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.currentTime > maxTimeWatched) {
      if (video.currentTime - maxTimeWatched < 2) {
        setMaxTimeWatched(video.currentTime);
      } else {
        video.currentTime = maxTimeWatched;
      }
    }
  };

  const handleSeeking = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.currentTime > maxTimeWatched) {
      video.currentTime = maxTimeWatched;
      alert("🛑 सुरक्षा नियम: आप ट्रेनिंग वीडियो को आगे नहीं बढ़ा सकते।");
    }
  };

  const handleVideoEnded = async () => {
    const result = await updateProgressOnBackend(currentVideo.videoId);
    if (result) {
      if (currentVideo.quiz && Array.isArray(currentVideo.quiz) && currentVideo.quiz.length > 0) {
        setQuizData(currentVideo.quiz);
        setShowQuiz(true);
      } else {
        alert("🎉 वीडियो समाप्त!");
        if (videoRef.current) { videoRef.current.currentTime = 0; videoRef.current.play(); }
      }
    }
  };

  const handleQuizSubmit = async () => {
    const answersArray = quizData.map((_, index) => selectedAnswers[index]);
    const result = await submitQuizOnBackend(currentVideo.videoId, answersArray);
    if (result) {
      if (onQuizSubmitSuccess) onQuizSubmitSuccess(result.quizResults);
      if (result.passed) {
        alert(`🎉 बधाई! स्कोर: ${result.score}`);
        setShowQuiz(false);
      } else {
        alert("❌ फेल! पुनः प्रयास करें।");
        setShowQuiz(false);
      }
    }
  };

  const getEmbedUrl = (url) => {
    let embedUrl = url;
    if (embedUrl.includes('uc?export=download&id=')) embedUrl = embedUrl.replace('uc?export=download&id=', 'file/d/');
    if (!embedUrl.includes('/preview')) embedUrl = embedUrl + '/preview';
    return embedUrl;
  };

  // 🟢 RENDER LOGIC
  if (hasAccess === null) return <div style={{ padding: '40px' }}>Loading...</div>;
  if (hasAccess === false) return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2>🔒 यह वीडियो पेड है</h2>
      <button onClick={() => window.location.href = '/profile'}>अभी पेमेंट करें</button>
    </div>
  );

  if (showQuiz) return (
    <div style={{ padding: '30px' }}>
      <h2>📝 असेसमेंट</h2>
      {/* Quiz UI here */}
      <button onClick={handleQuizSubmit}>सबमिट करें</button>
    </div>
  );

  return (
    <div style={{ padding: '30px' }}>
      <h2>{currentVideo.title}</h2>
      {isGoogleDrive ? (
        <iframe src={getEmbedUrl(currentVideo.url)} style={{ width: '100%', height: '500px' }} />
      ) : (
        <video ref={videoRef} src={currentVideo.url} controls onTimeUpdate={handleTimeUpdate} onEnded={handleVideoEnded} />
      )}
    </div>
  );
}
