// frontend/src/components/VideoPlayer.jsx
import React, { useContext, useRef, useState, useEffect } from 'react';
import { ProgressContext } from '../context/ProgressContext';

export default function VideoPlayer() {
  const { currentVideo, updateProgressOnBackend, modules, setCurrentVideo, currentUnlockedVideo } = useContext(ProgressContext);
  const videoRef = useRef(null);

  // 💡 ट्रैक रखने के लिए कि यूजर बिना स्किप किए अधिकतम किस सेकंड तक वीडियो देख चुका है
  const [maxTimeWatched, setMaxTimeWatched] = useState(0);

  // ⏱️ गूगल ड्राइव के लिए: पेज पर बिताए गए समय को ट्रैक करने की स्टेट्स
  const [secondsWatched, setSecondsWatched] = useState(0);
  const [isDriveVideoCompleted, setIsDriveVideoCompleted] = useState(false);
  const isGoogleDrive = currentVideo?.url?.includes('google.com') || currentVideo?.url?.includes('drive.google.com');

  // अनुमानित समय सीमा (अगर डेटाबेस में वीडियो की अवधि न हो, तो ड्राइव वीडियो के लिए डिफ़ॉल्ट 10 से 30 सेकंड का टाइमर, आप इसे बढ़ा सकते हैं)
  const DRIVE_REQUIRED_TIME = 15; 

  // 🔄 जैसे ही नया वीडियो लोड होगा (videoId बदलेगी), सभी ट्रैक्स और टाइमर रीसेट कर देंगे
  useEffect(() => {
    setMaxTimeWatched(0);
    setSecondsWatched(0);
    setIsDriveVideoCompleted(false);
  }, [currentVideo?.videoId]);

  // ⏳ गूगल ड्राइव वीडियो के लिए बैकग्राउंड टाइमर लॉजिक
  useEffect(() => {
    let interval = null;
    if (currentVideo && isGoogleDrive && !isDriveVideoCompleted) {
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
  }, [currentVideo?.videoId, isGoogleDrive, isDriveVideoCompleted]);

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
      }
    }
  };

  // 2️⃣ जैसे ही यूजर प्रोग्रेस बार पर आगे (Fast-Forward) कूदने की कोशिश करेगा, यह उसे वापस पटकेगा
  const handleSeeking = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.currentTime > maxTimeWatched) {
      console.log("Fast-forward blocked! Restoring to safely watched time:", maxTimeWatched);
      video.currentTime = maxTimeWatched;
      alert("🛑 सुरक्षा नियम: आप ट्रेनिंग वीडियो को आगे (Fast Forward) नहीं बढ़ा सकते। कृपया इसे पूरा बिना स्किप किए ध्यान से देखें।");
    }
  };

  // 3️⃣ जब वीडियो बिना स्किप किए सफलता पूर्वक समाप्त होगी या बटन क्लिक होगा
  const handleVideoEnded = async () => {
    alert("🎉 आपने यह वीडियो पूरा देख लिया है!");
    
    const result = await updateProgressOnBackend(currentVideo.videoId);
    
    if (result) {
      let flatVideos = [];
      modules.forEach(mod => {
        // मास्टर लिस्ट बनाते समय sequenceOrder के अनुसार सॉर्ट करना सुरक्षित रहता है
        const sortedVids = [...mod.videos].sort((a, b) => a.sequenceOrder - b.sequenceOrder);
        flatVideos.push(...sortedVids);
      });
      
      const currentIndex = flatVideos.findIndex(v => v.videoId === currentVideo.videoId);
      
      if (currentIndex !== -1 && currentIndex + 1 < flatVideos.length) {
        // अगले वीडियो पर ऑटोमैटिक स्विच करें
        setCurrentVideo(flatVideos[currentIndex + 1]);
      } else {
        alert("🏆 अद्भुत! आपने EWPP Training के सभी मॉड्यूल्स पूरे कर लिए हैं। अब आप सर्टिफाइड पार्टनर हैं!");
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

  return (
    <div style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc' }}>
      <div style={{ width: '100%', maxWidth: '850px', background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        
        <h2 style={{ marginTop: 0, color: '#1e293b', fontSize: '22px', marginBottom: '15px' }}>{currentVideo.title}</h2>
        
        {/* 📺 स्मार्ट हाइब्रिड वीडियो प्लेयर कंटेनर */}
        <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
          {isGoogleDrive ? (
            /* 🟢 गूगल ड्राइव वीडियो के लिए कड़क आईफ्रेम (Iframe) प्लेयर */
            <iframe
              src={getEmbedUrl(currentVideo.url)}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={currentVideo.title}
            ></iframe>
          ) : (
            /* 🔵 सामान्य MP4 वीडियो के लिए आपका पुराना ओरिजिनल प्लेयर विद फुल नो-स्किप लॉजिक */
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
              style={{ width: '100%', height: '100%' }}
            />
          )}
        </div>

        {/* 🎯 गूगल ड्राइव वीडियो के लिए प्रोग्रेस बटन जो समय पूरा होने से पहले अनलॉक नहीं होगा */}
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
                ✅ मैंने पूरा वीडियो देख लिया है - अगला वीडियो अनलॉक करें
              </button>
            )}
          </div>
        )}

        <div style={{ marginTop: '15px', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '6px', color: '#166534', fontSize: '13px' }}>
          💡 <strong>नियम:</strong> ट्रेनिंग को क्रमानुसार डिज़ाइन किया गया है। अगला वीडियो अनलॉक करने के लिए इस वीडियो को बिना स्किप किए पूरा अंत तक देखना आवश्यक है। यदि कोई पॉइंट समझ न आया हो, तो आप वीडियो को <strong>पीछे (Rewind)</strong> करके दोबारा देख सकते हैं।
        </div>
      </div>
    </div>
  );
}