// frontend/src/components/Sidebar.jsx
import React, { useState, useContext } from 'react';
import { ProgressContext } from '../context/ProgressContext';

export default function Sidebar() {
  const { modules, currentVideo, setCurrentVideo, completedVideos, currentUnlockedVideo } = useContext(ProgressContext);
  
  // 🟢 स्टेट्स: एक मॉड्यूल के लिए और एक एक्टिव सब-मॉड्यूल ट्रैक करने के लिए
  const [activeModuleId, setActiveModuleId] = useState(1);
  const [activeSubModuleId, setActiveSubModuleId] = useState(null);

  const checkIsLocked = (video) => {
    if (video.videoId === "m1s1-v1") return false;
    if (completedVideos.includes(video.videoId)) return false;
    if (currentUnlockedVideo === video.videoId) return false;
    return true;
  };

  // वीडियो आइटम रेंडर करने का हेल्पर फंक्शन
  const renderVideoItem = (vid) => {
    const isLocked = checkIsLocked(vid);
    const isCompleted = completedVideos.includes(vid.videoId);
    const isActive = currentVideo?.videoId === vid.videoId;

    return (
      <div 
        key={vid._id || vid.videoId}
        onClick={() => !isLocked && setCurrentVideo(vid)}
        style={{
          padding: '10px 15px',
          paddingLeft: '35px', // 🟢 थोड़ी और स्पेसिंग ताकि वीडियो सब-मॉड्यूल के अंदर लगे
          cursor: isLocked ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: isActive ? '#e0f2fe' : 'transparent',
          color: isLocked ? '#94a3b8' : '#1e293b',
          fontSize: '14px',
          borderLeft: isActive ? '4px solid #0284c7' : '4px solid transparent',
          transition: 'all 0.2s ease'
        }}
      >
        <span>{isLocked ? '🔒' : (isCompleted ? '✅' : '▶️')}</span>
        <span style={{ 
          fontWeight: isActive ? '600' : (isCompleted ? '700' : 'normal'),
          color: isCompleted ? '#475569' : (isActive ? '#0284c7' : '#1e293b')
        }}>
          {vid.sequenceOrder ? `${vid.sequenceOrder}. ` : ''}{vid.title}
        </span>
      </div>
    );
  };

  return (
    <div style={{ width: '320px', background: '#fff', borderRight: '1px solid #e2e8f0', height: 'calc(100vh - 56px)', overflowY: 'auto', padding: '15px' }}>
      <h3 style={{ marginTop: 0, color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>कोर्स मॉड्यूल्स</h3>
      
      {modules && modules.map((mod) => {
        const isModuleOpen = activeModuleId === mod.moduleId;
        return (
          <div key={mod._id || mod.moduleId} style={{ marginBottom: '10px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            
            {/* 1. MODULE HEADER */}
            <div 
              onClick={() => {
                setActiveModuleId(isModuleOpen ? null : mod.moduleId);
                setActiveSubModuleId(null); // मॉड्यूल बदलने पर पुराना सब-मॉड्यूल बंद कर दें
              }}
              style={{
                background: isModuleOpen ? '#f1f5f9' : '#fff',
                padding: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                justifyContent: 'space-between',
                color: '#334155',
                borderBottom: isModuleOpen ? '1px solid #e2e8f0' : 'none'
              }}
            >
              <span>{mod.title}</span>
              <span>{isModuleOpen ? '▼' : '►'}</span>
            </div>

            {/* 2. SUB-MODULES LIST */}
            {isModuleOpen && (
              <div style={{ background: '#f8fafc' }}>
                {mod.subModules && mod.subModules.length > 0 ? (
                  mod.subModules.map((subMod) => {
                    const isSubModuleOpen = activeSubModuleId === subMod.subModuleId;
                    return (
                      <div key={subMod._id || subMod.subModuleId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        
                        {/* SUB-MODULE HEADER (क्लिक करने पर ही वीडियो खुलेंगे) */}
                        <div 
                          onClick={() => setActiveSubModuleId(isSubModuleOpen ? null : subMod.subModuleId)}
                          style={{ 
                            padding: '10px 15px', 
                            fontSize: '12px', 
                            fontWeight: '700', 
                            color: isSubModuleOpen ? '#0284c7' : '#475569', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.05em',
                            background: isSubModuleOpen ? '#e2e8f0' : '#f1f5f9', 
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <span>{subMod.title}</span>
                          <span style={{ fontSize: '10px' }}>{isSubModuleOpen ? '▼' : '►'}</span>
                        </div>

                        {/* 3. VIDEOS LIST (केवल तभी दिखेगी जब सब-मॉड्यूल एक्टिव होगा) */}
                        {isSubModuleOpen && subMod.videos && (
                          <div style={{ background: '#fff', padding: '4px 0' }}>
                            {subMod.videos.map((vid) => renderVideoItem(vid))}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  // फॉलबैक: अगर किसी मॉड्यूल में सब-मॉड्यूल न हो तो सीधे वीडियो दिखें
                  mod.videos && mod.videos.map((vid) => renderVideoItem(vid))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
