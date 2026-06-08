// frontend/src/components/Sidebar.jsx
import React, { useState, useContext } from 'react';
import { ProgressContext } from '../context/ProgressContext';

export default function Sidebar() {
  const { modules, currentVideo, setCurrentVideo, completedVideos, currentUnlockedVideo } = useContext(ProgressContext);
  const [activeModuleId, setActiveModuleId] = useState(1);

  const checkIsLocked = (video) => {
    if (video.videoId === "m1-v1") return false;
    if (completedVideos.includes(video.videoId)) return false;
    if (currentUnlockedVideo === video.videoId) return false;
    return true;
  };

  // वीडियो आइटम रेंडर करने का कॉमन हेल्पर फंक्शन
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
          paddingLeft: '25px',
          cursor: isLocked ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: isActive ? '#e0f2fe' : 'transparent',
          color: isLocked ? '#94a3b8' : '#1e293b',
          fontSize: '14px',
          borderLeft: isActive ? '4px solid #0284c7' : '4px solid transparent'
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
        const isOpen = activeModuleId === mod.moduleId;
        return (
          <div key={mod._id || mod.moduleId} style={{ marginBottom: '10px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            
            <div 
              onClick={() => setActiveModuleId(isOpen ? null : mod.moduleId)}
              style={{
                background: isOpen ? '#f1f5f9' : '#fff',
                padding: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                justifyContent: 'space-between',
                color: '#334155'
              }}
            >
              <span>{mod.title}</span>
              <span>{isOpen ? '▼' : '►'}</span>
            </div>

            {isOpen && (
              <div style={{ background: '#f8fafc', padding: '5px 0' }}>
                {mod.subModules && mod.subModules.length > 0 ? (
                  mod.subModules.map((subMod) => (
                    <div key={subMod._id || subMod.subModuleId} style={{ marginBottom: '12px' }}>
                      <div style={{ 
                        padding: '6px 15px', fontSize: '12px', fontWeight: '700', 
                        color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em',
                        background: '#f1f5f9', margin: '4px 0'
                      }}>
                        {subMod.title}
                      </div>
                      {subMod.videos && subMod.videos.map((vid) => renderVideoItem(vid))}
                    </div>
                  ))
                ) : (
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
