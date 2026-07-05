// frontend/src/views/TestListPage.jsx
import React, { useContext } from 'react';
import { ProgressContext } from '../context/ProgressContext';

export default function TestListPage({ user, onBack, progressData }) {
  // 🔒 कांटेक्स्ट से डेटा निकालते समय ही डिफ़ॉल्ट वैल्यूज सेट कर दीं
 
  const context = useContext(ProgressContext) || {};
  
  // 🟢 एडमिन मोड के लिए 'progressData' का इस्तेमाल करें
  const modules = progressData ? (progressData.modules || []) : (Array.isArray(context.modules) ? context.modules : []);
  const completedVideos = user?.completedVideos || [];
  

  const setCurrentVideo = context.setCurrentVideo || (() => {});
  

  // 🛡️ पूरी तरह सुरक्षित वीडियो लिस्ट फ़िल्टरिंग
  let watchedVideosList = [];
  try {
    const allVideos = [];
    
    modules.forEach(m => {
      if (!m) return;
      
      // 1. अगर मॉड्यूल के अंदर सीधे वीडियोस हैं
      if (Array.isArray(m.videos)) {
        allVideos.push(...m.videos);
      }
      
      // 2. अगर मॉड्यूल के अंदर सब-मॉड्यूल हैं
      if (Array.isArray(m.subModules)) {
        m.subModules.forEach(sm => {
          if (sm && Array.isArray(sm.videos)) {
            allVideos.push(...sm.videos);
          }
        });
      }
    });

    // केवल वही वीडियोस निकालें जिनकी ID 'completedVideos' ऐरे में मौजूद है
    watchedVideosList = allVideos.filter(v => v && v.videoId && completedVideos.includes(v.videoId));
  } catch (err) {
    console.error("❌ TestListPage में वीडियो लिस्ट बनाते समय एरर आई:", err);
  }

  const handleStartTest = (video) => {
    if (video && typeof setCurrentVideo === 'function') {
      // 💡 वीडियो प्लेयर को सिग्नल देने के लिए लोकलस्टोरेज में फ्लैग सेट करें
      localStorage.setItem('autoStartQuiz', 'true'); 
      
      setCurrentVideo(video);
      if (typeof onBack === 'function') onBack();
    }
  };

  return (
    <div style={{ padding: '15px', maxWidth: '1000px', margin: '0 auto', boxSizing: 'border-box' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '10px', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '20px', fontWeight: '700' }}>
          📝 आपकी ऑनलाइन टेस्ट लिस्ट ({watchedVideosList.length})
        </h2>
        <button 
          onClick={onBack}
          style={{ backgroundColor: '#475569', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
        >
          ◀ वापस कोर्स पर जाएँ
        </button>
      </div>

      {watchedVideosList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
          <p style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 5px 0' }}>अभी यहाँ कोई test उपलब्ध नहीं है।</p>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>टेस्ट देने के लिए पहले कोर्स का कोई भी वीडियो पूरा देखें।</p>
        </div>
      ) : (
        /* 🟢 अपडेटेड रैपर: स्क्रॉल बार को हमेशा विजिबल और सुंदर बनाने के लिए */
        <div style={{ 
          width: '100%', 
          overflowX: 'auto', 
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin', // Firefox के लिए थिन स्क्रॉल बार
          scrollbarColor: '#64748b #f1f5f9', // स्क्रॉल बार का रंग
          backgroundColor: '#fff', 
          borderRadius: '8px', 
          border: '1px solid #e2e8f0', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          // वेबकिट ब्राउज़र्स (Chrome, Safari, Android) के लिए स्क्रॉल बार स्टाइलिंग
          paddingBottom: '5px' 
        }}>
          <style>
            {`
              div::-webkit-scrollbar { height: 8px; }
              div::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
              div::-webkit-scrollbar-thumb { background: #64748b; border-radius: 4px; border: 2px solid #f1f5f9; }
              div::-webkit-scrollbar-thumb:hover { background: #475569; }
            `}
          </style>
          
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            textAlign: 'left',
            minWidth: '600px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#1e293b', color: '#fff' }}>
                <th style={{ padding: '14px' }}>वीडियो कोड / नाम</th>
                <th style={{ padding: '14px', textAlign: 'center' }}>प्राप्त अंक (Score)</th>
                <th style={{ padding: '14px', textAlign: 'center' }}>स्थिति (Status)</th>
                <th style={{ padding: '14px', textAlign: 'center' }}>एक्शन</th>
              </tr>
            </thead>
            <tbody>
              {watchedVideosList.map((video) => {
                if (!video || !video.videoId) return null;
                
                const userResults = Array.isArray(user?.quizResults) ? user.quizResults : [];
                
                const testResult = userResults.find(r => {
                  return r && 
                         String(r.videoId).trim() === String(video.videoId).trim() && 
                         (r.passed === true || r.passed === 'true');
                });

                return (
                  <tr key={video.videoId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '14px', fontWeight: '500', color: '#334155', maxWidth: '260px', wordBreak: 'break-word' }}>
                      <span style={{ color: '#0284c7', marginRight: '6px' }}>[{video.videoId}]</span> 
                      {video.title || 'बिना नाम का वीडियो'}
                    </td>
                    <td style={{ padding: '14px', fontWeight: 'bold', color: testResult ? 'green' : '#94a3b8', textAlign: 'center' }}>
                      {testResult ? testResult.score : '—'}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      {testResult ? (
                        <span style={{ color: 'green', backgroundColor: '#dcfce7', padding: '4px 8px', borderRadius: '4px', fontWeight: '600', fontSize: '12px' }}>PASSED ✅</span>
                      ) : (
                        <span style={{ color: '#b45309', backgroundColor: '#fef3c7', padding: '4px 8px', borderRadius: '4px', fontWeight: '600', fontSize: '12px' }}>PENDING ⏳</span>
                      )}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <button 
                        onClick={() => handleStartTest(video)}
                        style={{ 
                          backgroundColor: testResult ? '#10b981' : '#0284c7', 
                          color: '#fff', 
                          border: 'none', 
                          padding: '8px 14px', 
                          borderRadius: '4px', 
                          cursor: 'pointer', 
                          fontWeight: 'bold',
                          fontSize: '13px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}
                      >
                        {testResult ? 'Retest 🔄' : 'Give Test 📝'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
