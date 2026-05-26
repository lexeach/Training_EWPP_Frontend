// frontend/src/components/VideoPlayer.jsx
import React, { useContext, useRef } from 'react';
import { ProgressContext } from '../context/ProgressContext';

export default function VideoPlayer() {
  const { currentVideo, updateProgressOnBackend, modules, setCurrentVideo, currentUnlockedVideo } = useContext(ProgressContext);
  const videoRef = useRef(null);

  if (!currentVideo) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>लोड हो रहा है...</div>;
  }

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
            key={currentVideo.videoId} // की बदलने से नया वीडियो प्लेयर फ्रेश रीलोड होगा
            src={currentVideo.url}
            controls
            controlsList="nodownload" // डाउनलोड रोकने के लिए बेसिक गार्ड
            onEnded={handleVideoEnded}
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        <div style={{ marginTop: '15px', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '6px', color: '#166534', fontSize: '13px' }}>
          💡 <strong>नियम:</strong> ट्रेनिंग को क्रमानुसार डिज़ाइन किया गया है। अगला वीडियो अनलॉक करने के लिए इस वीडियो को बिना स्किप किए पूरा अंत तक देखना आवश्यक है।
        </div>
      </div>
    </div>
  );
}