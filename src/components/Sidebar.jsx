// frontend/src/components/Sidebar.jsx
import React, { useState, useContext } from 'react';
import { ProgressContext } from '../context/ProgressContext';

export default function Sidebar({ onVideoSelect, isMobile }) { // 🟢 isMobile भी रिसीव किया
  const { modules, currentVideo, setCurrentVideo, completedVideos, currentUnlockedVideo } = useContext(ProgressContext);
  
  const [activeModuleId, setActiveModuleId] = useState(1);
  const [activeSubModuleId, setActiveSubModuleId] = useState(null);

  const checkIsLocked = (video) => {
    if (video.videoId === "m1s1-v1") return false;
    if (completedVideos.includes(video.videoId)) return false;
    if (currentUnlockedVideo === video.videoId) return false;
    return true;
  };

  const renderVideoItem = (vid) => {
    const isLocked = checkIsLocked(vid);
    const isCompleted = completedVideos.includes(vid.videoId);
    const isActive = currentVideo?.videoId === vid.videoId;

    const handleVideoClick = () => {
      if (!isLocked) {
        setCurrentVideo(vid);
        // 🟢 एक्शन ट्रिगर
        if (onVideoSelect) {
          onVideoSelect();
        }
      }
    };

    return (
      <div 
        key={vid._id || vid.videoId}
        onClick={handleVideoClick}
        style={{
          padding: '12px 15px',
          paddingLeft: '42px',
          cursor: isLocked ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: isActive ? '#e0f2fe' : '#ffffff', 
          color: isLocked ? '#94a3b8' : '#334155',
          fontSize: '13.5px',
          borderLeft: isActive ? '4px solid #0284c7' : '4px solid transparent',
          borderBottom: '1px solid #f1f5f9',
          transition: 'all 0.2s ease'
        }}
      >
        <span style={{ fontSize: '14px', display: 'flex', alignItems: 'center' }}>
          {isLocked ? '🔒' : (isCompleted ? '✅' : '▶️')}
        </span>
        <span style={{ 
          fontWeight: isActive ? '600' : '500',
          color: isCompleted ? '#64748b' : (isActive ? '#0284c7' : '#1e293b'),
          lineHeight: '1.4'
        }}>
          {vid.sequenceOrder ? `${vid.sequenceOrder}. ` : ''}{vid.title}
        </span>
      </div>
    );
  };

  return (
    // 🟢 यहाँ width को रिस्पॉन्सिव किया गया है ताकि मोबाइल पर एक्स्ट्रा स्पेस वेस्ट न हो
    <div style={{ width: isMobile ? '100%' : '320px', background: '#f8fafc', borderRight: isMobile ? 'none' : '1px solid #e2e8f0', height: isMobile ? 'auto' : 'calc(100vh - 56px)', overflowY: isMobile ? 'visible' : 'auto', padding: '15px', boxSizing: 'border-box' }}>
      <h3 style={{ marginTop: 0, color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', fontSize: '18px', fontWeight: '700' }}>
        कोर्स मॉड्यूल्स
      </h3>
      
      {modules && modules.map((mod) => {
        const isModuleOpen = activeModuleId === mod.moduleId;
        return (
          <div key={mod._id || mod.moduleId} style={{ marginBottom: '12px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            
            <div 
              onClick={() => {
                setActiveModuleId(isModuleOpen ? null : mod.moduleId);
                setActiveSubModuleId(null);
              }}
              style={{
                background: isModuleOpen ? '#1e293b' : '#334155',
                padding: '14px 15px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#ffffff',
                transition: 'background 0.2s ease'
              }}
            >
              <span style={{ fontSize: '14.5px', letterSpacing: '0.01em' }}>{mod.title}</span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>{isModuleOpen ? '▼' : '►'}</span>
            </div>

            {isModuleOpen && (
              <div style={{ background: '#f8fafc' }}>
                {mod.subModules && mod.subModules.length > 0 ? (
                  mod.subModules.map((subMod) => {
                    const isSubModuleOpen = activeSubModuleId === subMod.subModuleId;
                    return (
                      <div key={subMod._id || subMod.subModuleId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        
                        <div 
                          onClick={() => setActiveSubModuleId(isSubModuleOpen ? null : subMod.subModuleId)}
                          style={{ 
                            padding: '11px 15px', 
                            paddingLeft: '24px',
                            fontSize: '11.5px', 
                            fontWeight: '700', 
                            color: isSubModuleOpen ? '#0369a1' : '#475569', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.04em',
                            background: isSubModuleOpen ? '#e9bd9a' : '#87ceeb', 
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderLeft: '4px solid #cbd5e1'
                          }}
                        >
                          <span>{subMod.title}</span>
                          <span style={{ fontSize: '9px' }}>{isSubModuleOpen ? '▼' : '►'}</span>
                        </div>

                        {isSubModuleOpen && subMod.videos && (
                          <div style={{ background: '#ffffff' }}>
                            {subMod.videos.map((vid) => renderVideoItem(vid))}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  mod.videos && (
                    <div style={{ background: '#ffffff' }}>
                      {mod.videos.map((vid) => renderVideoItem(vid))}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
