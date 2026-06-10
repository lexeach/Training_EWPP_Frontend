import React, { useContext, useRef, useState, useEffect } from 'react';
import { ProgressContext } from '../context/ProgressContext';

export default function VideoPlayer({ onQuizStateChange }) {
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

  const isGoogleDrive = currentVideo?.url?.includes('google.com') || currentVideo?.url?.includes('drive.google.com');
  const DRIVE_REQUIRED_TIME = 15; 

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
      setShowQuiz(true); // 🎯 यह ट्रिगर होते ही ऊपर वाला useEffect पैरेंट साइडबार को छुपा देगा
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
    alert("🎉 आपने यह वीडियो पूरा देख लिया है!");
    const result = await updateProgressOnBackend(currentVideo.videoId);
    if (result) {
      if (!currentVideo.quiz || !Array.isArray(currentVideo.quiz) || currentVideo.quiz.length === 0) {
        handleNextVideoSwitch();
      } else {
        setQuizData(currentVideo.quiz);
        setShowQuiz(true);
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
          await updateProgressOnBackend(currentVideo.videoId);
          setShowQuiz(false);
          setSelectedAnswers({});
          handleNextVideoSwitch();
        } else {
          alert(`❌ आप टेस्ट पास नहीं कर पाए। स्कोर: ${result.score}/${result.totalQuestions}\n\nदोबारा प्रयास करें।`);
          setShowQuiz(false);
          setSelectedAnswers({});
          setMaxTimeWatched(0); 
          if (videoRef.current) videoRef.current.currentTime = 0;
        }
      }
    } catch (err) {
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
          <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', marginBottom: '25px' }}>
            <h2 style={{ marginTop: 0, color: '#1e293b', fontSize: '22px' }}>📝 ऑनलाइन असेसमेंट: {currentVideo.title}</h2>
          </div>
          {quizData.map((q, qIdx) => (
            <div key={qIdx} style={{ marginBottom: '25px', background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#0f172a' }}>प्रश्न {qIdx + 1}: {q.question}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {q.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[qIdx] === oIdx;
                  return (
                    <label key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', borderRadius: '6px', border: isSelected ? '1px solid #22c55e' : '1px solid #e2e8f0', background: isSelected ? '#f0fdf4' : '#ffffff', cursor: 'pointer' }}>
                      <input type="radio" name={`question-${qIdx}`} checked={isSelected} onChange={() => setSelectedAnswers({ ...selectedAnswers, [qIdx]: oIdx })} style={{ accentColor: '#22c55e' }} />
                      {opt}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
          <button onClick={handleQuizSubmit} style={{ background: '#22c55e', color: '#fff', padding: '14px 24px', border: 'none', borderRadius: '6px', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}>असेसमेंट सबमिट करें</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc' }}>
      <div style={{ width: '100%', maxWidth: '850px', background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginTop: 0, color: '#1e293b', fontSize: '22px', marginBottom: '15px' }}>{currentVideo.sequenceOrder ? `${currentVideo.sequenceOrder}. ` : ''}{currentVideo.title}</h2>
        <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
          {isGoogleDrive ? (
            <iframe src={getEmbedUrl(currentVideo.url)} style={{ width: '100%', height: '100%', border: 'none' }} allow="autoplay; encrypted-media" allowFullScreen title={currentVideo.title}></iframe>
          ) : (
            <>
              <video ref={videoRef} key={currentVideo.videoId} src={currentVideo.url} controls controlsList="nodownload" onTimeUpdate={handleTimeUpdate} onSeeking={handleSeeking} onSeeked={handleSeeking} onEnded={handleVideoEnded} onWaiting={() => setIsBuffering(true)} onPlaying={() => setIsBuffering(false)} onCanPlay={() => setIsBuffering(false)} style={{ width: '100%', height: '100%' }} />
              {isBuffering && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}><div style={{ width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid #0284c7', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>}
            </>
          )}
        </div>
        {isGoogleDrive && (
          <div style={{ marginTop: '20px' }}>
            {!isDriveVideoCompleted ? (
              <button disabled style={{ padding: '12px 24px', background: '#cbd5e1', color: '#64748b', border: 'none', borderRadius: '6px', width: '100%' }}>⏳ बचे हुए सेकंड: {DRIVE_REQUIRED_TIME - secondsWatched}s</button>
            ) : (
              <button onClick={handleVideoEnded} style={{ padding: '12px 24px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', width: '100%', fontWeight: 'bold' }}>✅ मैंने पूरा वीडियो देख लिया है</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
