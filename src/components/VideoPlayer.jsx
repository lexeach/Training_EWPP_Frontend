// frontend/src/components/VideoPlayer.jsx
import React, { useContext, useRef, useState, useEffect } from 'react';
import { ProgressContext } from '../context/ProgressContext';

export default function VideoPlayer({ onQuizStateChange, onQuizSubmitSuccess, onProfileClick }) {
  const { 
    currentVideo, 
    updateProgressOnBackend, 
    submitQuizOnBackend, 
    modules, 
    setCurrentVideo,
    user 
  } = useContext(ProgressContext);
  
  const videoRef = useRef(null);
  const [maxTimeWatched, setMaxTimeWatched] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizData, setQuizData] = useState([]);

  // 🟢 फिक्स: अगर user अभी तक लोड नहीं हुआ है, तो 'Locked' स्क्रीन न दिखाएं, 
  // सिर्फ एक क्लीन लोडिंग स्क्रीन दिखाएं।
  if (user === undefined || user === null) {
    return (
      <div style={{ flex: 1, padding: '50px', textAlign: 'center', background: '#f8fafc', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h2>Loading your training...</h2>
      </div>
    );
  }

  // 🟢 यहाँ अब user उपलब्ध है, अब सुरक्षित रूप से चेक करें
  const isFreeVideo = currentVideo?.sequenceOrder <= 3;
  const hasAccess = user?.isPaid === true || isFreeVideo;

  const isGoogleDrive = currentVideo?.url?.includes('google.com') || currentVideo?.url?.includes('drive.google.com');

  useEffect(() => {
    if (onQuizStateChange) onQuizStateChange(showQuiz);
  }, [showQuiz, onQuizStateChange]);

  useEffect(() => {
    setMaxTimeWatched(0);
    setShowQuiz(false);
    setSelectedAnswers({});
    setQuizData([]);
  }, [currentVideo?.videoId]);

  // 🟢 अगर पक्का हो गया कि access नहीं है, तभी 'Locked' दिखाएं
  if (!hasAccess) {
    return (
      <div style={{ flex: 1, padding: '50px', textAlign: 'center', background: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', border: '1px solid #fee2e2', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#e11d48' }}>🔒 यह वीडियो लॉक है</h2>
          <p style={{ color: '#475569', marginBottom: '20px' }}>यह प्रीमियम वीडियो देखने के लिए कृपया ट्रेनिंग फीस का भुगतान करें।</p>
          <button 
            onClick={onProfileClick}
            style={{ padding: '12px 24px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            पेमेंट पेज पर जाएं
          </button>
        </div>
      </div>
    );
  }

  if (!currentVideo) return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>डेटा लोड हो रहा है...</div>;

  // ... बाकी फंक्शन्स (handleTimeUpdate, handleVideoEnded, आदि) समान रहेंगे ...
  
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
      alert("🛑 सुरक्षा नियम: आप वीडियो को आगे नहीं बढ़ा सकते।");
    }
  };

  const handleVideoEnded = async () => {
    const result = await updateProgressOnBackend(currentVideo.videoId);
    if (result) {
      if (currentVideo.quiz?.length > 0) {
        setQuizData(currentVideo.quiz);
        setShowQuiz(true);
      } else {
        alert("🎉 वीडियो समाप्त!");
        if (videoRef.current) { videoRef.current.currentTime = 0; videoRef.current.play(); }
      }
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return "";
    let embedUrl = url;
    if (embedUrl.includes('uc?export=download&id=')) embedUrl = embedUrl.replace('uc?export=download&id=', 'file/d/');
    if (embedUrl.includes('/view?usp=sharing')) embedUrl = embedUrl.replace('/view?usp=sharing', '');
    if (!embedUrl.includes('/preview')) embedUrl = embedUrl + '/preview';
    return embedUrl;
  };

  if (showQuiz) {
    return (
      <div style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc' }}>
        <div style={{ width: '100%', maxWidth: '750px', background: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '22px', marginBottom: '25px' }}>📝 असेसमेंट: {currentVideo.title}</h2>
          <button onClick={() => alert('Quiz logic here')} style={{ background: '#22c55e', color: '#fff', padding: '14px', border: 'none', borderRadius: '6px', width: '100%', fontWeight: 'bold' }}>सबमिट करें</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc' }}>
      <div style={{ width: '100%', maxWidth: '850px', background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '22px', marginBottom: '15px' }}>{currentVideo.sequenceOrder}. {currentVideo.title}</h2>
        <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '6px', overflow: 'hidden' }}>
          {isGoogleDrive ? (
            <iframe src={getEmbedUrl(currentVideo.url)} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen></iframe>
          ) : (
            <video ref={videoRef} src={currentVideo.url} controls onTimeUpdate={handleTimeUpdate} onSeeking={handleSeeking} onEnded={handleVideoEnded} style={{ width: '100%', height: '100%' }} />
          )}
        </div>
      </div>
    </div>
  );
}
