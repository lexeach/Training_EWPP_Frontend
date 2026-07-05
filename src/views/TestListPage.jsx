import React, { useContext } from 'react';
import { ProgressContext } from '../context/ProgressContext';

export default function TestListPage({ user, onBack, progressData }) {
  // 🔒 कांटेक्स्ट से यूजर का प्रोग्रेस डेटा और कंट्रोल्स निकालें (यूजर मोड के लिए)
  const context = useContext(ProgressContext) || {};
  const contextCompletedVideos = Array.isArray(context.completedVideos) ? context.completedVideos : [];
  const contextModules = Array.isArray(context.modules) ? context.modules : [];
  const setCurrentVideo = context.setCurrentVideo || (() => {});

  // 🛡️ सटीक चेक: अगर URL में '/admin' है तो ही एडमिन माना जाएगा
  const isAdmin = window.location.pathname.includes('/admin');

  // 🟢 यूज़र के टेस्ट और क्विज़ का लाइव डेटा निकालें (चाहे पैरेंट से आए या कांटेक्स्ट से)
  const quizResults = user?.quizResults || context?.quizResults || [];
  const completedVideos = isAdmin ? (user?.completedVideos || []) : contextCompletedVideos;

  let displayTests = [];
  let masterVideosMap = {};

  // 1. कोर्स के सभी मॉड्यूल्स से वीडियो लिस्ट को फ्लैट मैप में इकट्ठा करना (ताकि वीडियो ऑब्जेक्ट ढूंढा जा सके)
  const targetModules = (progressData && Array.isArray(progressData) && progressData.length > 0 && progressData[0].modules) 
    ? progressData[0].modules 
    : contextModules;

  try {
    if (Array.isArray(targetModules)) {
      targetModules.forEach(m => {
        if (!m) return;
        if (Array.isArray(m.videos)) {
          m.videos.forEach(v => { if (v && v.videoId) masterVideosMap[v.videoId] = v; if (v && v.id) masterVideosMap[v.id] = v; });
        }
        if (Array.isArray(m.subModules)) {
          m.subModules.forEach(sm => {
            if (sm && Array.isArray(sm.videos)) {
              sm.videos.forEach(v => { if (v && v.videoId) masterVideosMap[v.videoId] = v; if (v && v.id) masterVideosMap[v.id] = v; });
            }
          });
        }
      });
    }
  } catch (err) {
    console.error("❌ मॉड्यूल्स पार्स करने में एरर:", err);
  }

  // 2. डिस्प्ले लिस्ट तैयार करना
  if (completedVideos.length > 0) {
    completedVideos.forEach(vidId => {
      const videoObj = masterVideosMap[vidId];
      const quizInfo = quizResults.find(q => q && String(q.videoId).trim() === String(vidId).trim());

      let customTitle = videoObj?.title || videoObj?.name || vidId;
      if (!videoObj) {
        if (vidId === "m1s1-v1") customTitle = "[m1s1-v1] Exowa क्या है?";
        else if (vidId === "m1s1-v2") customTitle = "[m1s1-v2] Program का उद्देश्य";
        else if (vidId === "m1s1-v3") customTitle = "[m1s1-v3] Women empowerment vision";
        else if (vidId === "m1s1-v4") customTitle = "[m1s1-v4] आपको क्या करना है ?";
        else if (vidId === "m1s2-v1" || vidId === "m2s1-v1") customTitle = "[m1s2-v1] Work from home";
        else if (vidId === "m1s2-v2" || vidId === "m2s1-v2") customTitle = "[m1s2-v2] सम्मान + income";
        else if (vidId === "m1s2-v3" || vidId === "m2s1-v3") customTitle = "[m1s2-v3] Strategic Mindset for EWPP Partners";
        else if (vidId === "m1s2-v4" || vidId === "m2s1-v4") customTitle = "[m1s2-v4] Housewives भी क्यों सफल हो सकती हैं";
      }

      displayTests.push({
        id: vidId,
        title: customTitle,
        score: quizInfo ? (quizInfo.score !== undefined ? quizInfo.score : '--') : '—',
        passed: quizInfo ? (quizInfo.passed === true || quizInfo.passed === 'true') : false,
        rawVideo: videoObj || { videoId: vidId, id: vidId, title: customTitle }
      });
    });
  } else if (quizResults.length > 0 && isAdmin) {
    displayTests = quizResults.map(q => {
      let customTitle = q.videoId;
      if (q.videoId === "m1s1-v1") customTitle = "[m1s1-v1] Exowa क्या है?";
      else if (q.videoId === "m1s1-v2") customTitle = "[m1s1-v2] Program का उद्देश्य";
      else if (q.videoId === "m1s1-v3") customTitle = "[m1s1-v3] Women empowerment vision";
      else if (q.videoId === "m1s1-v4") customTitle = "[m1s1-v4] आपको क्या करना है ?";
      else if (q.videoId === "m1s2-v1" || q.videoId === "m2s1-v1") customTitle = "[m1s2-v1] Work from home";
      else if (q.videoId === "m1s2-v2" || q.videoId === "m2s1-v2") customTitle = "[m1s2-v2] सम्मान + income";
      else if (q.videoId === "m1s2-v3" || q.videoId === "m2s1-v3") customTitle = "[m1s2-v3] Strategic Mindset for EWPP Partners";
      else if (q.videoId === "m1s2-v4" || q.videoId === "m2s1-v4") customTitle = "[m1s2-v4] Housewives भी क्यों सफल हो सकती हैं";

      return {
        id: q.videoId,
        title: customTitle,
        score: q.score !== undefined ? q.score : '--',
        passed: q.passed === true || q.passed === 'true',
        rawVideo: { videoId: q.videoId, id: q.videoId, title: customTitle }
      };
    });
  }

  const handleStartTest = (videoObj) => {
    if (videoObj && typeof setCurrentVideo === 'function') {
      localStorage.setItem('autoStartQuiz', 'true'); 
      setCurrentVideo(videoObj);
      if (typeof onBack === 'function') onBack();
    }
  };

  return (
    <div style={{ padding: '15px', maxWidth: '1000px', margin: '0 auto', boxSizing: 'border-box', fontFamily: 'sans-serif' }}>
      
      {/* 👤 एडमिन के लिए पार्टनर डिटेल्स कार्ड (केवल एडमिन पैनल पर दिखेगा) */}
      {isAdmin && user && (
        <div style={{ 
          backgroundColor: '#f8fafc', 
          border: '1px solid #cbd5e1', 
          borderRadius: '8px', 
          padding: '16px', 
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#475569', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            👤 पार्टनर क्रेडेंशियल्स (Partner Details)
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '15px' }}>
            <p style={{ margin: 0, color: '#1e293b' }}>
              <strong>नाम:</strong> <span style={{ color: '#0284c7', fontWeight: '600' }}>{user.name || ' उपलब्ध नहीं'}</span>
            </p>
            <p style={{ margin: 0, color: '#1e293b' }}>
              <strong>ईमेल:</strong> <span style={{ color: '#334155' }}>{user.email || ' उपलब्ध नहीं'}</span>
            </p>
            <p style={{ margin: 0, color: '#1e293b' }}>
              <strong>मोबाइल/फ़ोन:</strong> <span style={{ color: '#334155' }}>{user.phone || user.mobile || ' उपलब्ध नहीं'}</span>
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '10px', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '20px', fontWeight: '700' }}>
          📝 {isAdmin ? 'पार्टनर ऑनलाइन टेस्ट लिस्ट' : 'आपकी ऑनलाइन टेस्ट लिस्ट'} ({displayTests.length})
        </h2>
        <button 
          onClick={onBack}
          style={{ backgroundColor: '#475569', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
        >
          {isAdmin ? '◀ वापस एडमिन लिस्ट पर' : '◀ वापस कोर्स पर जाएँ'}
        </button>
      </div>

      {displayTests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
          <p style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 5px 0' }}>अभी यहाँ कोई test उपलब्ध नहीं है।</p>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>टेस्ट देने के लिए पहले कोर्स का कोई भी वीडियो पूरा देखें।</p>
        </div>
      ) : (
        <div style={{ 
          width: '100%', 
          overflowX: 'auto', 
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin',
          scrollbarColor: '#64748b #f1f5f9',
          backgroundColor: '#fff', 
          borderRadius: '8px', 
          border: '1px solid #e2e8f0', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
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
                <th style={{ padding: '14px' }}>वीडियो नाम</th>
                <th style={{ padding: '14px', textAlign: 'center' }}>प्राप्त अंक</th>
                <th style={{ padding: '14px', textAlign: 'center' }}>स्थिति</th>
                <th style={{ padding: '14px', textAlign: 'center' }}>एक्शन</th>
              </tr>
            </thead>
            <tbody>
              {displayTests.map((test, index) => (
                <tr key={test.id || index} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: index % 2 === 0 ? '#f8fafc' : '#fff' }}>
                  <td style={{ padding: '14px', fontWeight: '500', color: '#334155', maxWidth: '320px', wordBreak: 'break-word' }}>
                    {test.title}
                  </td>
                  <td style={{ padding: '14px', fontWeight: 'bold', color: test.score !== '—' && test.score !== '--' ? 'green' : '#94a3b8', textAlign: 'center' }}>
                    {test.score}
                  </td>
                  <td style={{ padding: '14px', textAlign: 'center' }}>
                    {test.passed ? (
                      <span style={{ color: 'green', backgroundColor: '#dcfce7', padding: '4px 8px', borderRadius: '4px', fontWeight: '600', fontSize: '12px' }}>PASSED ✅</span>
                    ) : (
                      <span style={{ color: '#b45309', backgroundColor: '#fef3c7', padding: '4px 8px', borderRadius: '4px', fontWeight: '600', fontSize: '12px' }}>PENDING ⏳</span>
                    )}
                  </td>
                  <td style={{ padding: '14px', textAlign: 'center' }}>
                    {isAdmin ? (
                      <button 
                        style={{ padding: '8px 14px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'not-allowed', color: '#94a3b8', fontSize: '13px', fontWeight: 'bold' }} 
                        disabled
                      >
                        Retest 🔄
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleStartTest(test.rawVideo)}
                        style={{ 
                          backgroundColor: '#0284c7', 
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
                        Retest 🔄
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
