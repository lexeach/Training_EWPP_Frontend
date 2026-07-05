import React from 'react';

export default function TestListPage({ user, onBack, progressData, onRetest }) {
  // 🟢 यूज़र के टेस्ट और क्विज़ का लाइव डेटा निकालें
  const quizResults = user?.quizResults || [];
  const completedVideos = user?.completedVideos || [];

  // 🛡️ 100% सटीक चेक: अगर URL में '/admin' है तो ही एडमिन माना जाएगा
  const isAdmin = window.location.pathname.includes('/admin');

  let displayTests = [];

  // 1. अगर हमें प्रॉपर कोर्स स्ट्रक्चर (modules) मिला है (यूजर पैनल का नॉर्मल फ्लो)
  if (progressData && Array.isArray(progressData) && progressData.length > 0 && progressData[0].modules) {
    progressData.forEach(item => {
      if (item.modules && Array.isArray(item.modules)) {
        item.modules.forEach(mod => {
          if (mod.videos && Array.isArray(mod.videos)) {
            mod.videos.forEach(vid => {
              if (completedVideos.includes(vid.id)) {
                const quizInfo = quizResults.find(q => q.videoId === vid.id);
                displayTests.push({
                  id: vid.id,
                  title: vid.title || vid.name || `टेस्ट (${vid.id})`,
                  score: quizInfo ? quizInfo.score : '--',
                  passed: quizInfo ? quizInfo.passed : false
                });
              }
            });
          }
        });
      }
    });
  } 
  // 🚨 2. एडमिन पैनल या सीधा फॉलबैक
  else if (quizResults.length > 0) {
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
        passed: q.passed !== undefined ? q.passed : true
      };
    });
  }

  // रीटेस्ट क्लिक हैंडलर
  const handleRetestClick = (videoId) => {
    if (onRetest) {
      onRetest(videoId);
    } else {
      // अगर पैरेंट में फंक्शन नहीं भी बना, तो यूजर को अलर्ट दिखेगा ताकि क्रैश न हो
      alert(`वीडियो आईडी ${videoId} के लिए टेस्ट दोबारा शुरू हो रहा है...`);
    }
  };

  return (
    <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>📝 ऑनलाइन टेस्ट लिस्ट ({displayTests.length})</h2>
        <button 
          onClick={onBack} 
          style={{ padding: '6px 12px', background: '#e2e8f0', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ◀ वापस
        </button>
      </div>

      {displayTests.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>अभी यहाँ कोई test उपलब्ध नहीं है।</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
          <thead>
            <tr style={{ background: '#0f172a', color: '#fff', textAlign: 'left' }}>
              <th style={{ padding: '12px', borderRadius: '4px 0 0 4px' }}>वीडियो नाम</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>प्राप्त अंक</th>
              <th style={{ padding: '12px' }}>स्थिति</th>
              <th style={{ padding: '12px', borderRadius: '0 4px 4px 0' }}>एक्शन</th>
            </tr>
          </thead>
          <tbody>
            {displayTests.map((test, index) => (
              <tr key={test.id || index} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: index % 2 === 0 ? '#f8fafc' : '#fff' }}>
                <td style={{ padding: '14px 12px', fontWeight: '500', color: '#334155' }}>{test.title}</td>
                <td style={{ padding: '14px 12px', fontWeight: 'bold', color: '#0284c7', textAlign: 'center' }}>{test.score}</td>
                <td style={{ padding: '14px 12px' }}>
                  {test.passed ? (
                    <span style={{ color: '#16a34a', fontWeight: 'bold' }}>PASSED ✅</span>
                  ) : (
                    <span style={{ color: '#dc2626', fontWeight: 'bold' }}>FAILED ❌</span>
                  )}
                </td>
                <td style={{ padding: '14px 12px' }}>
                  {isAdmin ? (
                    /* 🔒 एडमिन पैनल में धुंधला (Locked) बटन */
                    <button 
                      style={{ padding: '6px 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'not-allowed', color: '#94a3b8', fontSize: '13px' }} 
                      disabled
                    >
                      Retest 🔄
                    </button>
                  ) : (
                    /* 🔓 यूजर पैनल पर चमकदार, नीला और चालू (Active) बटन */
                    <button 
                      onClick={() => handleRetestClick(test.id)}
                      style={{ padding: '6px 12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)' }}
                    >
                      Retest 🔄
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
