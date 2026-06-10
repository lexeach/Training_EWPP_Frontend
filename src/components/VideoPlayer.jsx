// frontend/src/components/VideoPlayer.jsx
import React, { useContext, useRef, useState, useEffect } from 'react';
import { ProgressContext } from '../context/ProgressContext';

export default function VideoPlayer() {
  // 🎯 कांटेक्स्ट से डेटा निकाला
  const { 
    currentVideo, 
    updateProgressOnBackend, 
    submitQuizOnBackend, 
    modules, 
    setCurrentVideo, 
    currentUnlockedVideo 
  } = useContext(ProgressContext);
  
  const videoRef = useRef(null);

  // 💡 ट्रैक रखने के लिए कि यूजर बिना स्किप किए अधिकतम किस सेकंड तक वीडियो देख चुका है
  const [maxTimeWatched, setMaxTimeWatched] = useState(0);

  // ⏱️ गूगल ड्राइव के लिए: पेज पर बिताए गए समय को ट्रैक करने की स्टेट्स
  const [secondsWatched, setSecondsWatched] = useState(0);
  const [isDriveVideoCompleted, setIsDriveVideoCompleted] = useState(false);
  const isGoogleDrive = currentVideo?.url?.includes('google.com') || currentVideo?.url?.includes('drive.google.com');

  // अनुमानित समय सीमा (ड्राइव वीडियो के लिए डिफ़ॉल्ट 15 सेकंड का टाइमर)
  const DRIVE_REQUIRED_TIME = 15; 

  // 🎯 ऑनलाइन असेसमेंट (Quiz) के लिए स्टेट्स
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizData, setQuizData] = useState([]);

  // ⏳ वीडियो बफ़रिंग / लोडिंग स्टेट
  const [isBuffering, setIsBuffering] = useState(false);

  // 🔄 जैसे ही नया वीडियो लोड होगा, सभी ट्रैक्स, टाइमर और क्विज़ स्टेट्स रीसेट कर देंगे
  useEffect(() => {
    setMaxTimeWatched(0);
    setSecondsWatched(0);
    setIsDriveVideoCompleted(false);
    setShowQuiz(false);
    setSelectedAnswers({});
    setQuizData([]);
    setIsBuffering(false);
  }, [currentVideo?.videoId]);

  // 📝 🟢 नया लॉजिक: टेस्ट लिस्ट से मैनुअल "Give Test" बटन क्लिक होने पर डायरेक्ट क्विज़ मोड ऑन करना
  useEffect(() => {
    const shouldStartQuiz = localStorage.getItem('autoStartQuiz');
    
    if (shouldStartQuiz === 'true' && currentVideo?.quiz && Array.isArray(currentVideo.quiz) && currentVideo.quiz.length > 0) {
      localStorage.removeItem('autoStartQuiz'); // फ्लैग साफ़ करें
      setQuizData(currentVideo.quiz);
      setShowQuiz(true); // सीधे टेस्ट स्क्रीन ओपन करें
      console.log("📝 टेस्ट लिस्ट से मैनुअली टेस्ट रिक्वेस्ट आई है, क्विज़ मोड ऑन किया गया।");
    }
  }, [currentVideo]);

  // ⏳ गूगल ड्राइव वीडियो के लिए बैकग्राउंड टाइमर लॉजिक
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
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentVideo?.videoId, isGoogleDrive, isDriveVideoCompleted, showQuiz]);

  if (!currentVideo) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>लोड हो रहा है...</div>;
  }

  // 1️⃣ हर सेकंड जब वीडियो नॉर्मली चलेगी, यह फंक्शन यूजर की वास्तविक प्रोग्रेस रिकॉर्ड करेगा
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.currentTime > maxTimeWatched) {
      if (video.currentTime - maxTimeWatched < 2) {
        setMaxTimeWatched(video.currentTime);
      } else {
        // 🛑 अगर किसी और तरीके से वीडियो अचानक आगे कूद गया, तो उसे वापस पटकें
        video.currentTime = maxTimeWatched;
      }
    }
  };

  // 2️⃣ जैसे ही यूजर प्रोग्रेस बार पर आगे (Fast-Forward) कूदने की कोशिश करेगा, यह तुरंत BLOCK करेगा
  const handleSeeking = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.currentTime > maxTimeWatched) {
      console.log("Fast-forward blocked! Restoring to safely watched time:", maxTimeWatched);
      video.currentTime = maxTimeWatched;
      alert("🛑 सुरक्षा नियम: आप ट्रेनिंग वीडियो को आगे (Fast Forward) नहीं बढ़ा सकते। कृपया इसे पूरा बिना स्किप किए ध्यान से देखें।");
    }
  };

  // 🔄 ऑटो-नेक्स्ट वीडियो स्विच करने का कॉमन हेल्पर फंक्शन (क्विज़ पास करने के बाद या बिना क्विज़ वाले वीडियो के लिए)
  const handleNextVideoSwitch = () => {
    let flatVideos = [];
    
    // 🟢 3-Tier फ्लैटनिंग लॉजिक - subModules को डीपली चेक करता है
    modules.forEach(mod => {
      if (mod.subModules && Array.isArray(mod.subModules) && mod.subModules.length > 0) {
        mod.subModules.forEach(subMod => {
          if (subMod.videos && Array.isArray(subMod.videos)) {
            flatVideos.push(...subMod.videos);
          }
        });
      } else if (mod.videos && Array.isArray(mod.videos)) {
        flatVideos.push(...mod.videos);
      }
    });
    
    // डेटा को sequenceOrder के आधार पर सॉर्ट करना ताकि क्रम न बिगड़े
    flatVideos.sort((a, b) => a.sequenceOrder - b.sequenceOrder);
    
    const currentIndex = flatVideos.findIndex(v => v.videoId === currentVideo.videoId);
    
    if (currentIndex !== -1 && currentIndex + 1 < flatVideos.length) {
      // अगले वीडियो पर ऑटोमैटिक स्विच करें
      setCurrentVideo(flatVideos[currentIndex + 1]);
    } else {
      alert("🏆 अद्भुत! आपने EWPP Training के सभी मॉड्यूल्स पूरे कर लिए हैं। अब आप सर्टिफाइड पार्टनर हैं!");
    }
  };

  // 3️⃣ जब वीडियो बिना स्किप किए सफलता पूर्वक समाप्त होगी या बटन क्लिक होगा
  const handleVideoEnded = async () => {
    alert("🎉 आपने यह वीडियो पूरा देख लिया है!");
    
    // 🟢 प्रोग्रेस को डेटाबेस में सेव करें ताकि वीडियो Completed मार्क हो जाए और 'Test List' में भी दिखने लगे
    const result = await updateProgressOnBackend(currentVideo.videoId);
    
    if (result) {
      // अगर वीडियो में कोई क्विज़ नहीं है, तो डायरेक्ट अगला वीडियो लोड करें
      if (!currentVideo.quiz || !Array.isArray(currentVideo.quiz) || currentVideo.quiz.length === 0) {
        handleNextVideoSwitch();
      } else {
        alert("📝 इस वीडियो का टेस्ट 'ऑनलाइन टेस्ट लिस्ट' में जोड़ दिया गया है। आप वहाँ से इसे कभी भी मैनुअली दे सकते हैं!");
      }
    }
  };

  // 📝 टेस्ट/असेसमेंट सबमिट करने का हैंडलर
  const handleQuizSubmit = async () => {
    const totalQuestions = quizData.length;
    const answeredCount = Object.keys(selectedAnswers).length;
    
    if (answeredCount < totalQuestions) {
      alert("🛑 कृपया असेसमेंट सबमिट करने से पहले सभी प्रश्नों के उत्तर चुनें।");
      return;
    }

    const answersArray = quizData.map((_, index) => selectedAnswers[index]);
    
    // बैकएंड पर क्विज़ सबमिट करें (यह डेटाबेस में पास/फेल और स्कोर स्टोर करता है)
    const result = await submitQuizOnBackend(currentVideo.videoId, answersArray);
    
    if (result) {
      if (result.passed) {
        alert(`🎉 बधाई हो! आप टेस्ट पास कर चुके हैं। स्कोर: ${result.score}/${result.totalQuestions}`);
        
        // 🎯 सुधार: टेस्ट पास होने के बाद भी प्रोग्रेस को दोबारा सिंक करें ताकि डेटाबेस में प्रोग्रेस लॉक हो जाए
        await updateProgressOnBackend(currentVideo.videoId);
        
        setShowQuiz(false);
        setSelectedAnswers({});
        handleNextVideoSwitch(); // टेस्ट पास होने पर ही अगला वीडियो लोड होगा
      } else {
        alert(`❌ आप टेस्ट पास नहीं कर पाए। स्कोर: ${result.score}/${result.totalQuestions}\n\nपास होने के लिए कम से कम 50% सही उत्तर आवश्यक हैं। कृपया वीडियो दोबारा देखें और फिर से प्रयास करें।`);
        setShowQuiz(false);
        setSelectedAnswers({});
        setMaxTimeWatched(0); // वीडियो को दोबारा से देखने के लिए सेफगार्ड रिसेट
        if (videoRef.current) videoRef.current.currentTime = 0;
      }
    }
  };

  // गूगल ड्राइव यूआरएल को एम्बेड करने योग्य 'preview' फॉर्मेट में बदलने का हेल्पर फंक्शन
  const getEmbedUrl = (url) => {
    if (!url) return "";
    let embedUrl = url;
    if (embedUrl.includes('uc?export=download&id=')) {
      embedUrl = embedUrl.replace('uc?export=download&id=', 'file/d/');
    }
    if (embedUrl.includes('/view?usp=sharing')) {
      embedUrl = embedUrl.replace('/view?usp=sharing', '');
    }
    if (embedUrl.endsWith('/')) {
      embedUrl = embedUrl.slice(0, -1);
    }
    if (!embedUrl.includes('/preview')) {
      embedUrl = embedUrl + '/preview';
    }
    return embedUrl;
  };

  // 📝 अगर क्विज़ मोड एक्टिव है, तो प्लेयर की जगह यह सुंदर असेसमेंट यूआई दिखेगा
  if (showQuiz) {
    return (
      <div style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc' }}>
        <div style={{ width: '100%', maxWidth: '750px', background: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          
          <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', marginBottom: '25px' }}>
            <h2 style={{ marginTop: 0, color: '#1e293b', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              📝 ऑनलाइन असेसमेंट: {currentVideo.title}
            </h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
              वीडियो के आधार पर सही विकल्प चुनें। पास होने के लिए <strong>50% अंक</strong> प्राप्त करना अनिवार्य है।
            </p>
          </div>

          {quizData.map((q, qIdx) => (
            <div key={qIdx} style={{ marginBottom: '25px', background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#0f172a', fontSize: '15.5px', fontWeight: '600', lineHeight: '1.5' }}>
                प्रश्न {qIdx + 1}: {q.question}
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {q.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[qIdx] === oIdx;
                  return (
                    <label 
                      key={oIdx} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        padding: '12px 15px', 
                        borderRadius: '6px', 
                        cursor: 'pointer', 
                        border: isSelected ? '1px solid #22c55e' : '1px solid #e2e8f0', 
                        background: isSelected ? '#f0fdf4' : '#ffffff', 
                        color: isSelected ? '#166534' : '#334155',
                        fontWeight: isSelected ? '600' : '500',
                        fontSize: '14px',
                        transition: 'all 0.15s ease' 
                      }}
                    >
                      <input 
                        type="radio" 
                        name={`question-${qIdx}`} 
                        checked={isSelected}
                        onChange={() => setSelectedAnswers({ ...selectedAnswers, [qIdx]: oIdx })}
                        style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#22c55e' }}
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          <button 
            onClick={handleQuizSubmit} 
            style={{ 
              background: '#22c55e', 
              color: '#fff', 
              padding: '14px 24px', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              width: '100%', 
              fontWeight: 'bold', 
              fontSize: '16px',
              boxShadow: '0 4px 6px rgba(34, 197, 94, 0.2)',
              transition: 'background 0.2s' 
            }}
          >
            असेसमेंट सबमिट करें
          </button>
        </div>
      </div>
    );
  }

  // 📺 सामान्य वीडियो प्लेयर व्यू रेंडरिंग
  return (
    <div style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc' }}>
      <div style={{ width: '100%', maxWidth: '850px', background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        
        <h2 style={{ marginTop: 0, color: '#1e293b', fontSize: '22px', marginBottom: '15px' }}>
          {currentVideo.sequenceOrder ? `${currentVideo.sequenceOrder}. ` : ''}{currentVideo.title}
        </h2>
        
        {/* 📺 स्मार्ट हाइब्रिड वीडियो प्लेयर कंटेनर */}
        <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
          {isGoogleDrive ? (
            /* 🟢 गूगल ड्राइव वीडियो के लिए आईफ्रेम (Iframe) प्लेयर */
            <iframe
              src={getEmbedUrl(currentVideo.url)}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={currentVideo.title}
            ></iframe>
          ) : (
            /* 🔵 सामान्य MP4 वीडियो के लिए नो-स्किप और बफ़रिंग लॉजिक के साथ मजबूत प्लेयर */
            <>
              <video
                ref={videoRef}
                key={currentVideo.videoId}
                src={currentVideo.url}
                controls
                controlsList="nodownload"
                onTimeUpdate={handleTimeUpdate}
                onSeeking={handleSeeking}
                onSeeked={handleSeeking}
                onEnded={handleVideoEnded}
                onWaiting={() => setIsBuffering(true)}   // 🟡 बफ़रिंग शुरू हुई
                onPlaying={() => setIsBuffering(false)}  // 🟢 बफ़रिंग ख़त्म हुई
                onCanPlay={() => setIsBuffering(false)}  // 🟢 वीडियो प्ले होने के लिए रेडी
                style={{ width: '100%', height: '100%' }}
              />

              {/* ⏳ बफ़रिंग स्पिनर यूआई (सिर्फ लोडिंग के समय दिखेगा) */}
              {isBuffering && (
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 10
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    border: '5px solid #f3f3f3',
                    borderTop: '5px solid #0284c7',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <p style={{ color: '#fff', marginTop: '12px', fontWeight: '600', fontSize: '15px' }}>
                    वीडियो लोड हो रहा है, कृपया प्रतीक्षा करें...
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* 🎯 गूगल ड्राइव वीडियो के लिए प्रोग्रेस बटन */}
        {isGoogleDrive && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            {!isDriveVideoCompleted ? (
              <button 
                disabled 
                style={{ padding: '12px 24px', background: '#cbd5e1', color: '#64748b', border: 'none', borderRadius: '6px', cursor: 'not-allowed', fontWeight: 'bold', width: '100%' }}
              >
                ⏳ कृपया वीडियो ध्यान से देखें (बचे हुए सेकंड: {DRIVE_REQUIRED_TIME - secondsWatched}s)
              </button>
            ) : (
              <button 
                onClick={handleVideoEnded}
                style={{ padding: '12px 24px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', width: '100%', boxShadow: '0 4px 6px rgba(34, 197, 94, 0.2)', transition: 'background 0.2s' }}
              >
                ✅ मैंने पूरा वीडियो देख लिया है - प्रोग्रेस सबमिट करें
              </button>
            )}
          </div>
        )}

        <div style={{ marginTop: '15px', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '6px', color: '#166534', fontSize: '13px' }}>
          💡 <strong>नियम:</strong> ट्रेनिंग को क्रमानुसार डिज़ाइन किया गया है। वीडियो पूरा होने के बाद आप 'ऑनलाइन टेस्ट लिस्ट' में जाकर इसका test (Assessment) मैनुअली दे सकते हैं। उसे पास करने के बाद ही अगला चैप्टर अनलॉक होगा।
        </div>
      </div>
    </div>
  );
}
