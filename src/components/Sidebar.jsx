// frontend/src/components/Sidebar.jsx
import React, { useState, useContext } from 'react';
import { ProgressContext } from '../context/ProgressContext';

export default function Sidebar() {
  const { modules, currentVideo, setCurrentVideo, completedVideos, currentUnlockedVideo } = useContext(ProgressContext);
  
  // यूजर के अनुभव के लिए डिफ़ॉल्ट रूप से पहला मॉड्यूल खुला रखें
  const [activeModuleId, setActiveModuleId] = useState(1);
  const [activeSubModuleId, setActiveSubModuleId] = useState(null);

  const checkIsLocked = (video) => {
    if (video.videoId === "m1s1-v1") return false;
    if (completedVideos.includes(video.videoId)) return false;
    if (currentUnlockedVideo === video.videoId) return false;
    return true;
  };

  // 🔵 TIER 3: वीडियो आइटम का आरामदायक और प्रोफेशनल डिज़ाइन
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
          paddingLeft: '42px', // अंदर की तरफ धकेला ताकि Hierarchy साफ दिखे
          cursor: isLocked ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          // एक्टिव होने पर स्काई-ब्लू हाइलाइट, वरना क्लीन वाइट
          background: isActive ? '#e0f2fe' : '#ffffff', 
          color: isLocked ? '#94a3b8' : '#334155',
          fontSize: '13.5px',
          // एक्टिव वीडियो के लेफ्ट साइड में सुंदर इंडिकेटर पट्टी
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
    <div style={{ width: '320px', background: '#f8fafc', borderRight: '1px solid #e2e8f0', height: 'calc(100vh - 56px)', overflowY: 'auto', padding: '15px' }}>
      <h3 style={{ marginTop: 0, color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', fontSize: '18px', fontWeight: '700' }}>
        कोर्स मॉड्यूल्स
      </h3>
      
      {modules && modules.map((mod) => {
        const isModuleOpen = activeModuleId === mod.moduleId;
        return (
          <div key={mod._id || mod.moduleId} style={{ marginBottom: '12px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            
            {/* 🔴 TIER 1: MODULE HEADER (डार्क और बोल्ड प्रीमियम लुक) */}
            <div 
              onClick={() => {
                setActiveModuleId(isModuleOpen ? null : mod.moduleId);
                setActiveSubModuleId(null); // मॉड्यूल चेंज होते ही पुराने सब-मॉड्यूल को बंद करें
              }}
              style={{
                background: isModuleOpen ? '#1e293b' : '#334155', // खुला होने पर गहरा स्लेट, बंद होने पर थोड़ा हल्का स्लेट
                padding: '14px 15px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#ffffff', // व्हाइट टेक्स्ट से आँखों को बहुत आराम मिलता है
                transition: 'background 0.2s ease'
              }}
            >
              <span style={{ fontSize: '14.5px', letterSpacing: '0.01em' }}>{mod.title}</span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>{isModuleOpen ? '▼' : '►'}</span>
            </div>

            {/* SUB-MODULES CONTAINER */}
            {isModuleOpen && (
              <div style={{ background: '#f8fafc' }}>
                {mod.subModules && mod.subModules.length > 0 ? (
                  mod.subModules.map((subMod) => {
                    const isSubModuleOpen = activeSubModuleId === subMod.subModuleId;
                    return (
                      <div key={subMod._id || subMod.subModuleId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        
                        {/* 🟢 TIER 2: SUB-MODULE HEADER (सॉफ्ट मैटी लाइट-ग्रे शेड) */}
                        <div 
                          onClick={() => setActiveSubModuleId(isSubModuleOpen ? null : subMod.subModuleId)}
                          style={{ 
                            padding: '11px 15px', 
                            paddingLeft: '24px',
                            fontSize: '11.5px', 
                            fontWeight: '700', 
                            // एक्टिव सब-मॉड्यूल का टेक्स्ट डीप ब्लू, नॉर्मल का डार्क म्यूटेड ग्रे
                            color: isSubModuleOpen ? '#0369a1' : '#475569', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.04em',
                            // एक्टिव होने पर हल्का डार्क ग्रे, वरना एकदम सॉफ्ट लाइट ग्रे
                            background: isSubModuleOpen ? '#e9bd9a' : '#87ceeb', 
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderLeft: '4px solid #cbd5e1' // सब-मॉड्यूल की पहचान के लिए साइड में हल्की ग्रे पट्टी
                          }}
                        >
                          <span>{subMod.title}</span>
                          <span style={{ fontSize: '9px' }}>{isSubModuleOpen ? '▼' : '►'}</span>
                        </div>

                        {/* TIER 3: VIDEOS LIST (केवल क्लिक करने पर खुलेगी) */}
                        {isSubModuleOpen && subMod.videos && (
                          <div style={{ background: '#ffffff' }}>
                            {subMod.videos.map((vid) => renderVideoItem(vid))}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  // सेफ फॉलबैक: अगर किसी मॉड्यूल में डायरेक्ट वीडियो हो
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
