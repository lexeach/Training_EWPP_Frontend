// frontend/src/pages/TestListPage.jsx
import React, { useContext } from 'react';
import { ProgressContext } from '../context/ProgressContext';

export default function TestListPage({ user, onBack }) {
  // 🔒 कांटेक्स्ट से डेटा निकालते समय ही डिफ़ॉल्ट वैल्यूज सेट कर दीं
  const context = useContext(ProgressContext) || {};
  const completedVideos = Array.isArray(context.completedVideos) ? context.completedVideos : [];
  const modules = Array.isArray(context.modules) ? context.modules : [];
  const setCurrentVideo = context.setCurrentVideo || (() => {});

  // 🛡️ पूरी तरह सुरक्षित वीडियो लिस्ट फ़िल्टरिंग (हर लेवल पर सुरक्षा जाँच)
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
      setCurrentVideo(video);
      if (typeof onBack === 'function') onBack();
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '22px', fontWeight: '700' }}>📝 आपकी ऑनलाइन टेस्ट लिस्ट ({watchedVideosList.length})</h2>
        <button 
          onClick={onBack}
          style={{ backgroundColor: '#475569', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
        >
          ◀ वापस कोर्स पर जाएँ
        </button>
      </div>

      {watchedVideosList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
          <p style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 5px 0' }}>अभी यहाँ कोई टेस्ट उपलब्ध नहीं है।</p>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>टेस्ट देने के लिए पहले कोर्स का कोई भी वीडियो पूरा देखें।</p>
        </div>
      ) : (
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#1e293b', color: '#fff' }}>
                <th style={{ padding: '14px' }}>वीडियो कोड / नाम</th>
                <th style={{ padding: '14px' }}>प्राप्त अंक (Score)</th>
                <th style={{ padding: '14px' }}>स्थिति (Status)</th>
                <th style={{ padding: '14px' }}>एक्शन</th>
              </tr>
            </thead>
            <tbody>
              {watchedVideosList.map((video) => {
                if (!video || !video.videoId) return null;
                
                // सुरक्षित तरीके से टेस्ट का रिजल्ट ढूंढना
                const userResults = Array.isArray(user?.quizResults) ? user.quizResults : [];
                const testResult = userResults.find(r => r && r.videoId === video.videoId && r.passed === true);

                return (
                  <tr key={video.videoId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '14px', fontWeight: '500', color: '#334155' }}>
                      <span style={{ color: '#0284c7', marginRight: '6px' }}>[{video.videoId}]</span> 
                      {video.title || 'बिना नाम का वीडियो'}
                    </td>
                    <td style={{ padding: '14px', fontWeight: 'bold', color: testResult ? 'green' : '#94a3b8' }}>
                      {testResult ? testResult.score : '—'}
                    </td>
                    <td style={{ padding: '14px' }}>
                      {testResult ? (
                        <span style={{ color: 'green', backgroundColor: '#dcfce7', padding: '4px 8px', borderRadius: '4px', fontWeight: '600', fontSize: '12px' }}>PASSED ✅</span>
                      ) : (
                        <span style={{ color: '#b45309', backgroundColor: '#fef3c7', padding: '4px 8px', borderRadius: '4px', fontWeight: '600', fontSize: '12px' }}>PENDING ⏳</span>
                      )}
                    </td>
                    <td style={{ padding: '14px' }}>
                      {testResult ? (
                        <button disabled style={{ backgroundColor: '#f1f5f9', color: '#94a3b8', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'not-allowed' }}>कम्पलीटेड</button>
                      ) : (
                        <button 
                          onClick={() => handleStartTest(video)}
                          style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          Give Test 📝
                        </button>
                      )}
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
