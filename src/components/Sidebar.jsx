// frontend/src/components/Sidebar.jsx
import React, { useState, useContext } from 'react';
import { ProgressContext } from '../context/ProgressContext';

export default function Sidebar() {
  const { modules, currentVideo, setCurrentVideo, completedVideos, currentUnlockedVideo } = useContext(ProgressContext);
  
  const [activeModuleId, setActiveModuleId] = useState(1);
  const [activeSubModuleId, setActiveSubModuleId] = useState(null);

  const checkIsLocked = (video) => {
    if (video.videoId === "m1s1-v1") return false;
    if (completedVideos.includes(video.videoId)) return false;
    if (currentUnlockedVideo === video.videoId) return false;
    return true;
  };

  // 🔵 TIER 3: वीडियो आइटम रेंडर करने का हेल्पर फंक्शन (खूबसूरत कलर कोडिंग के साथ)
  const renderVideoItem = (vid) => {
    const isLocked = checkIsLocked(vid);
    const isCompleted = completedVideos.includes(vid.videoId);
    const isActive = currentVideo?.videoId === vid.videoId;

    return (
      <div 
        key={vid._id || vid.videoId}
        onClick={() => !isLocked && setCurrentVideo(vid)}
        style={{
          padding: '12px 15px',
          paddingLeft: '40px', // अंदर की तरफ धकेला ताकि पदानुक्रम (Hierarchy) दिखे
          cursor: isLocked ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          // एक्टिव होने पर सॉफ्ट ब्लू, नॉर्मल होने पर क्लीन वाइट
          background: isActive ? '#e0f2fe' : '#ffffff', 
          color: isLocked ? '#94a3b8' : '#334155',
          fontSize: '13.5px',
          // एक्टिव होने पर बाईं तरफ एक मोटी ब्लू लाइन
          borderLeft: isActive ? '4px solid #0284c7' : '4px solid transparent',
          borderBottom: '1px solid #f1f5f9',
          transition: 'all 0.2s ease'
        }}
      >
        <span style={{ fontSize: '15px' }}>
          {isLocked ? '🔒' : (isCompleted ? '✅' : '▶️')}
        </span>
        <span style={{ 
          fontWeight: isActive ? '600' : '500',
          // कम्पलीटेड का शांत कलर, एक्टिव का चटक ब्लू, नॉर्मल का डार्क ग्रे
          color: isCompleted ? '#64748b' : (isActive ? '#0284c7' : '#334155'),
          textDecoration: isCompleted ? 'line-through' : 'none' // कम्पलीटेड पर हल्की लाइन (ऑप्शनल)
        }}>
          {vid.sequenceOrder ? `${vid.sequenceOrder}. ` : ''}{vid.title}
        </span>
      </div>
    );
  };

  return (
    <div style={{ width: '320px', background: '#f8fafc', borderRight: '1px solid #e2e8f0', height: 'calc(100vh - 56px)', overflowY: 'auto', padding: '15px' }}>
      <h3 style={{ marginTop: 0, color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', fontSize: '18px', fontWeight: '700' }}>
        कोर्स मॉड्यूल्स
      </h3>
      
      {modules && modules.map((mod) => {
        const isModuleOpen = activeModuleId === mod.moduleId;
        return (
          <div key={mod._id || mod.moduleId} style={{ marginBottom: '12px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            
            {/* 🔴 TIER 1: MODULE HEADER (डार्क और प्रीमियम लुक) */}
            <div 
              onClick={() => {
                setActiveModuleId(isModuleOpen ? null : mod.moduleId);
                setActiveSubModuleId(null);
              }}
              style={{
                background: isModuleOpen ? '#1e293b' : '#334155', // डार्क स्लेट कलर्स
                padding: '14px 15px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#ffffff', // सफेद टेक्स्ट आँखों को सुकून देगा
                transition: 'background 0.3s ease'
              }}
            >
              <span style={{ fontSize: '14.5px', letterSpacing: '0.02em' }}>{mod.title}</span>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>{isModuleOpen ? '▼' : '►'}</span>
            </div>

            {/* TIER 2 & 3 CONTAINER */}
            {isModuleOpen && (
              <div style={{ background: '#f8fafc' }}>
                {mod.subModules && mod.subModules.length > 0 ? (
                  mod.subModules.map((subMod) => {
                    const isSubModuleOpen = activeSubModuleId === subMod.subModuleId;
                    return (
                      <div key={subMod._id || subMod.subModuleId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        
                        {/* 🟢 TIER 2: SUB-MODULE HEADER (सॉफ्ट ग्रे-ब्लू मैटी लुक) */}
                        <div 
                          onClick={() => setActiveSubModuleId(isSubModuleOpen ? null : subMod.subModuleId)}
                          style={{ 
                            padding: '10px 15px', 
                            paddingLeft: '22px',
                            fontSize: '11.5px', 
                            fontWeight: '700', 
                            // एक्टिव होने पर टेक्स्ट ब्लू, वरना ग्रे-ब्लैक
                            color: isSubModuleOpen ? '#0369a1' : '#475569', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.05em',
                            // एक्टिव होने पर थोड़ा डार्क ग्रे, वरना एकदम लाइट ग्रे-ब्लू
                            background: isSubModuleOpen ? '#e2e8f0' : '#f1f5f9', 
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderLeft: '4px solid #cbd5e1' // सब-मॉड्यूल की पहचान के लिए साइड बार
                          }}
                        >
                          <span>{subMod.title}</span>
                          <span style={{ fontSize: '9px' }}>{isSubModuleOpen ? '▼' : '►'}</span>
                        </div>

                        {/* TIER 3: VIDEOS LIST */}
                        {isSubModuleOpen && subMod.videos && (
                          <div style={{ background: '#ffffff' }}>
                            {subMod.videos.map((vid) => renderVideoItem(vid))}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  // फॉलबैक
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
