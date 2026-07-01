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
    user // 🟢 कॉन्टेक्स्ट से user डेटा लिया
  } = useContext(ProgressContext);
  
  const videoRef = useRef(null);
  const [maxTimeWatched, setMaxTimeWatched] = useState(0);
  const [secondsWatched, setSecondsWatched] = useState(0);
  const [isDriveVideoCompleted, setIsDriveVideoCompleted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizData, setQuizData] = useState([]);
  const [isBuffering, setIsBuffering] = useState(false);

  // 🟢 एक्सेस कंट्रोल: अगर sequenceOrder 3 तक है या यूजर ने पेमेंट किया है, तो एक्सेस है
  const isFreeVideo = currentVideo?.sequenceOrder <= 3;
  const hasAccess = user?.isPaid === true || isFreeVideo;
  //const hasAccess = user?.isPaid || isFreeVideo;

  const isGoogleDrive = currentVideo?.url?.includes('google.com') || currentVideo?.url?.includes('drive.google.com');
  const DRIVE_REQUIRED_TIME = 15; 

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

  useEffect(() => {
    const shouldStartQuiz = localStorage.getItem('autoStartQuiz');
    if (shouldStartQuiz === 'true' && currentVideo?.quiz && Array.isArray(currentVideo.quiz) && currentVideo.quiz.length > 0) {
      localStorage.removeItem('autoStartQuiz'); 
      setQuizData(currentVideo.quiz);
      setShowQuiz(true);
    }
  }, [currentVideo]);

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

  // 🟢 एक्सेस डिनाइड UI
  if (!hasAccess) {
    return (
      <div style={{ flex: 1, padding: '50px', textAlign: 'center', background: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', border: '1px solid #fee2e2', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#e11d48' }}>🔒 यह वीडियो लॉक है</h2>
          <p style={{ color: '#475569', marginBottom: '20px' }}>यह प्रीमियम वीडियो देखने के लिए कृपया ट्रेनिंग फीस का भुगतान करें।</p>
          <button 
  onClick={onProfileClick} // 🟢 यहाँ सीधे प्रॉप का इस्तेमाल करें
  style={{ 
    padding: '12px 24px', 
    background: '#0284c7', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    fontWeight: 'bold' 
  }}
>
  पेमेंट पेज पर जाएं
</button>
        </div>
      </div>
    );
  }

  if (!currentVideo) return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>लोड हो रहा है...</div>;

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

  const handleNextVideoSwitch = () => {
    let flatVideos = [];
    modules.forEach(mod => {
      if (mod.subModules && Array.isArray(mod.subModules) && mod.subModules.length > 0) {
        mod.subModules.forEach(subMod => { if (subMod.videos) flatVideos.push(...subMod.videos); });
      } else if (mod.videos) {
        flatVideos.push(...mod.videos);
      }
    });
    flatVideos.sort((a, b) => a.sequenceOrder - b.sequenceOrder);
    const currentIndex = flatVideos.findIndex(v => v.videoId === currentVideo.videoId);
    
    if (currentIndex !== -1 && currentIndex + 1 < flatVideos.length) {
      setCurrentVideo(flatVideos[currentIndex + 1]);
    } else {
      alert("🏆 अद्भुत! आपने EWPP Training के सभी मॉड्यूल्स पूरे कर लिए हैं।");
    }
  };

  const handleVideoEnded = async () => {
    const result = await updateProgressOnBackend(currentVideo.videoId);
    if (result) {
      if (currentVideo.quiz && Array.isArray(currentVideo.quiz) && currentVideo.quiz.length > 0) {
        setQuizData(currentVideo.quiz);
        setShowQuiz(true);
      } else {
        alert("🎉 वीडियो समाप्त! वीडियो को फिर से शुरू किया जा रहा है।");
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play();
        }
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
          alert(`🎉 बधाई हो! स्कोर: ${result.score}/${result.totalQuestions}`);
          if (onQuizSubmitSuccess && result.quizResults) onQuizSubmitSuccess(result.quizResults);
          await updateProgressOnBackend(currentVideo.videoId);
          setShowQuiz(false);
          setSelectedAnswers({});
          handleNextVideoSwitch();
        } else {
          alert(`❌ आप टेस्ट पास नहीं कर पाए। स्कोर: ${result.score}/${result.totalQuestions}\n\nदोबारा प्रयास करें।`);
          if (onQuizSubmitSuccess && result.quizResults) onQuizSubmitSuccess(result.quizResults);
          setShowQuiz(false);
          setSelectedAnswers({});
          setMaxTimeWatched(0); 
          if (videoRef.current) videoRef.current.currentTime = 0;
        }
      }
    } catch (err) {
      console.error("Quiz submission error:", err);
      alert("🛑 तकनीकी त्रुटि आई है।");
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return "";
    let embedUrl = url;
    if (embedUrl.includes('uc?export=download&id=')) embedUrl = embedUrl.replace('uc?export=download&id=', 'file/d/');
    if (embedUrl.includes('/view?usp=sharing')) embedUrl = embedUrl.replace('/view?usp=sharing', '');
    if (embedUrl.endsWith('/')) embedUrl = embedUrl.slice(0, -1);
    if (!embedUrl.includes('/preview')) embedUrl = embedUrl + '/preview';
    return embedUrl;
  };

  if (showQuiz) {
    return (
      <div style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc' }}>
        <div style={{ width: '100%', maxWidth: '750px', background: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '22px', marginBottom: '25px' }}>📝 ऑनलाइन असेसमेंट: {currentVideo.title}</h2>
          {quizData.map((q, qIdx) => (
            <div key={qIdx} style={{ marginBottom: '25px', background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 15px 0' }}>प्रश्न {qIdx + 1}: {q.question}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {q.options.map((opt, oIdx) => (
                  <label key={oIdx} style={{ padding: '12px', borderRadius: '6px', border: selectedAnswers[qIdx] === oIdx ? '1px solid #22c55e' : '1px solid #e2e8f0', background: selectedAnswers[qIdx] === oIdx ? '#f0fdf4' : '#fff', cursor: 'pointer' }}>
                    <input type="radio" name={`question-${qIdx}`} checked={selectedAnswers[qIdx] === oIdx} onChange={() => setSelectedAnswers({ ...selectedAnswers, [qIdx]: oIdx })} /> {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button onClick={handleQuizSubmit} style={{ background: '#22c55e', color: '#fff', padding: '14px', border: 'none', borderRadius: '6px', width: '100%', fontWeight: 'bold' }}>असेसमेंट सबमिट करें</button>
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
            <video ref={videoRef} src={currentVideo.url} controls controlsList="nodownload" onTimeUpdate={handleTimeUpdate} onSeeking={handleSeeking} onEnded={handleVideoEnded} style={{ width: '100%', height: '100%' }} />
          )}
        </div>
        {isGoogleDrive && (
          <div style={{ marginTop: '20px' }}>
            {!isDriveVideoCompleted ? <button disabled style={{ padding: '12px', width: '100%', background: '#cbd5e1' }}>⏳ बचे हुए सेकंड: {DRIVE_REQUIRED_TIME - secondsWatched}s</button> : <button onClick={handleVideoEnded} style={{ padding: '12px', width: '100%', background: '#22c55e', color: '#fff', fontWeight: 'bold' }}>✅ मैंने पूरा वीडियो देख लिया है</button>}
          </div>
        )}
      </div>
    </div>
  );
}
