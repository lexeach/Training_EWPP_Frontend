// frontend/src/views/TestListPage.jsx
import React, { useContext } from 'react';
import { ProgressContext } from '../context/ProgressContext';

export default function TestListPage({ user, onBack }) {
  // 🔒 कांटेक्स्ट से डेटा निकालते समय ही डिफ़ॉल्ट वैल्यूज सेट कर दीं
  const context = useContext(ProgressContext) || {};
  const completedVideos = Array.isArray(context.completedVideos) ? context.completedVideos : [];
  const modules = Array.isArray(context.modules) ? context.modules : [];
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
      // 💡 वीडियो प्लेयर को接收 सिग्नल देने के लिए लोकलस्टोरेज में फ्लैग सेट करें
      localStorage.setItem('autoStartQuiz', 'true'); 
      
      setCurrentVideo(video);
      if (typeof onBack === 'function') onBack();
    }
  };

  return (
    // 🟢 आउटर कंटेनर में मोबाइल फ्रेंडली पैडिंग सेट की ताकि स्क्रीन एज से न चिपके
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
        /* 🟢 जादुई रैपर डिब्बा: यह मोबाइल पर टेबल के बड़ा होते ही हॉरिजॉन्टल स्क्रॉलर एक्टिव कर देगा */
        <div style={{ 
          width: '100%', 
          overflowX: 'auto', 
          WebkitOverflowScrolling: 'touch', // iOS पर स्मूथ फील के लिए
          backgroundColor: '#fff', 
          borderRadius: '8px', 
          border: '1px solid #e2e8f0', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)' 
        }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            textAlign: 'left',
            minWidth: '600px' // 🟢 मोबाइल स्क्रीन पर टेबल को पिचकने से रोकेगा, जिससे स्क्रॉलर शो होगा
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
                
                // सुरक्षित तरीके से टेस्ट का रिजल्ट ढूंढना
                const userResults = Array.isArray(user?.quizResults) ? user.quizResults : [];
                
                // चेक करें कि क्या यूजर ने इस वीडियो का टेस्ट पास किया हुआ है
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
                          backgroundColor: testResult ? '#10b981' : '#0284c7', // पास होने पर बटन ग्रीन दिखेगा, वरना ब्लू
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
