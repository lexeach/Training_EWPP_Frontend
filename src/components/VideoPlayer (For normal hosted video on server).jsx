// frontend/src/components/VideoPlayer.jsx
import React, { useContext, useRef, useState, useEffect } from 'react';
import { ProgressContext } from '../context/ProgressContext';

export default function VideoPlayer() {
  const { currentVideo, updateProgressOnBackend, modules, setCurrentVideo, currentUnlockedVideo } = useContext(ProgressContext);
  const videoRef = useRef(null);

  // 💡 ट्रैक रखने के लिए कि यूजर बिना स्किप किए अधिकतम किस सेकंड तक वीडियो देख चुका है
  const [maxTimeWatched, setMaxTimeWatched] = useState(0);

  // 🔄 जैसे ही नया वीडियो लोड होगा (videoId बदलेगी), पुराना ट्रैक रीसेट कर देंगे
  useEffect(() => {
    setMaxTimeWatched(0);
  }, [currentVideo?.videoId]);

  if (!currentVideo) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>लोड हो रहा है...</div>;
  }

  // 1️⃣ हर सेकंड जब वीडियो नॉर्मली चलेगी, यह फंक्शन यूजर की वास्तविक प्रोग्रेस रिकॉर्ड करेगा
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    // अगर यूजर बिना स्किप किए आगे बढ़ रहा है, तो मैक्सिमम टाइम अपडेट करते रहो
    if (video.currentTime > maxTimeWatched) {
      // अगर अचानक टाइम 2 सेकंड से ज़्यादा जम्प करता है, तो इसका मतलब यूज़र ने प्रोग्रेस बार से छेड़छाड़ की है
      if (video.currentTime - maxTimeWatched < 2) {
        setMaxTimeWatched(video.currentTime);
      }
    }
  };

  // 2️⃣ जैसे ही यूजर प्रोग्रेस बार पर आगे (Fast-Forward) कूदने की कोशिश करेगा, यह उसे वापस पटकेगा
  const handleSeeking = () => {
    const video = videoRef.current;
    if (!video) return;

    // 🚫 अगर करंट टाइम यूजर की देखी गई अधिकतम सीमा (maxTimeWatched) को पार कर रहा है
    if (video.currentTime > maxTimeWatched) {
      console.log("Fast-forward blocked! Restoring to safely watched time:", maxTimeWatched);
      video.currentTime = maxTimeWatched; // वापस पुरानी जगह पर खींच लाए
      alert("🛑 सुरक्षा नियम: आप ट्रेनिंग वीडियो को आगे (Fast Forward) नहीं बढ़ा सकते। कृपया इसे पूरा बिना स्किप किए ध्यान से देखें।");
    }
  };

  // 3️⃣ जब वीडियो बिना स्किप किए सफलता पूर्वक समाप्त होगी
  const handleVideoEnded = async () => {
    alert("🎉 आपने यह वीडियो पूरा देख लिया है!");
    
    // बैकएंड पर प्रोग्रेस सेव करें और अगला अनलॉक वीडियो प्राप्त करें
    const result = await updateProgressOnBackend(currentVideo.videoId);
    
    if (result) {
      // सभी मॉड्यूल्स से अगले वीडियो का पता लगाएं ताकि उसे आटोमेटिक प्ले किया जा सके
      let flatVideos = [];
      modules.forEach(mod => flatVideos.push(...mod.videos));
      
      const currentIndex = flatVideos.findIndex(v => v.videoId === currentVideo.videoId);
      
      if (currentIndex !== -1 && currentIndex + 1 < flatVideos.length) {
        // अगले वीडियो पर ऑटोमैटिक स्विच करें
        setCurrentVideo(flatVideos[currentIndex + 1]);
      } else {
        alert("🏆 अद्भुत! आपने EWPP Training के सभी मॉड्यूल्स पूरे कर लिए हैं। अब आप सर्टिफाइड पार्टनर हैं!");
      }
    }
  };

  return (
    <div style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc' }}>
      <div style={{ width: '100%', maxWidth: '850px', background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        
        <h2 style={{ marginTop: 0, color: '#1e293b', fontSize: '22px', marginBottom: '15px' }}>{currentVideo.title}</h2>
        
        <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '6px', overflow: 'hidden' }}>
          <video
            ref={videoRef}
            key={currentVideo.videoId} // की बदलने से नया वीडियो प्लेयर फ्रेश रीलोड होगा और स्टेट्स भी फ्रेश हो जाएंगी
            src={currentVideo.url}
            controls
            controlsList="nodownload" // डाउनलोड रोकने के लिए बेसिक गार्ड
            onTimeUpdate={handleTimeUpdate} // 🚀 रियल-टाइम यूज़र टाइमलाइन मॉनिटर
            onSeeking={handleSeeking}       // 🚀 जैसे ही माउस से प्रोग्रेस बार आगे दबाया, तुरंत ब्लॉक
            onSeeked={handleSeeking}        // 🚀 डबल लेयर सिक्योरिटी (क्लिक रिलीज होने पर भी चेक)
            onEnded={handleVideoEnded}
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        <div style={{ marginTop: '15px', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '6px', color: '#166534', fontSize: '13px' }}>
          💡 <strong>नियम:</strong> ट्रेनिंग को क्रमानुसार डिज़ाइन किया गया है। अगला वीडियो अनलॉक करने के लिए इस वीडियो को बिना स्किप किए पूरा अंत तक देखना आवश्यक है। यदि कोई पॉइंट समझ न आया हो, तो आप वीडियो को <strong>पीछे (Rewind)</strong> करके दोबारा देख सकते हैं।
        </div>
      </div>
    </div>
  );
}