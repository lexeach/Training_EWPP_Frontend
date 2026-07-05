import React, { useContext, useEffect } from 'react';
import { ProgressContext } from '../context/ProgressContext';

export default function TestListPage({ user, onBack, progressData }) {
  const context = useContext(ProgressContext) || {};
  
  // 🟢 एडमिन मोड या यूजर मोड के हिसाब से modules तय करें
  // अगर progressData (Admin) मौजूद है तो उसे लें, वरना Context का इस्तेमाल करें
  const modules = progressData && progressData.length > 0 
    ? progressData 
    : (Array.isArray(context.modules) ? context.modules : []);

  // 🟢 अगर 'user' प्रॉप्स में है (Admin mode), तो उसका इस्तेमाल करें, वरना Context का
  const currentUser = user || context.user || {};
  const completedVideos = Array.isArray(currentUser.completedVideos) ? currentUser.completedVideos : [];
  const userResults = Array.isArray(currentUser.quizResults) ? currentUser.quizResults : [];
  
  const setCurrentVideo = context.setCurrentVideo || (() => {});

  // 🛡️ सुरक्षित वीडियो लिस्ट फ़िल्टरिंग
  let watchedVideosList = [];
  try {
    const allVideos = [];
    modules.forEach(m => {
      if (!m) return;
      if (Array.isArray(m.videos)) allVideos.push(...m.videos);
      if (Array.isArray(m.subModules)) {
        m.subModules.forEach(sm => {
          if (sm && Array.isArray(sm.videos)) allVideos.push(...sm.videos);
        });
      }
    });

    watchedVideosList = allVideos.filter(v => v && v.videoId && completedVideos.includes(v.videoId));
  } catch (err) {
    console.error("❌ TestListPage में वीडियो लिस्ट बनाते समय एरर:", err);
  }

  const handleStartTest = (video) => {
    // एडमिन पैनल में 'Give Test' पर क्लिक करने पर क्या होना चाहिए? 
    // अगर आप एडमिन को टेस्ट नहीं देने देना चाहते, तो यहाँ रोकें:
    if (user) {
        alert("एडमिन मोड में आप टेस्ट नहीं दे सकते।");
        return;
    }
    
    if (video && typeof setCurrentVideo === 'function') {
      localStorage.setItem('autoStartQuiz', 'true'); 
      setCurrentVideo(video);
      if (typeof onBack === 'function') onBack();
    }
  };

  return (
    <div style={{ padding: '15px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px' }}>📝 ऑनलाइन टेस्ट लिस्ट ({watchedVideosList.length})</h2>
        <button onClick={onBack} style={{ padding: '10px 16px', borderRadius: '6px', cursor: 'pointer' }}>◀ वापस</button>
      </div>

      {watchedVideosList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <p>अभी यहाँ कोई test उपलब्ध नहीं है।</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ backgroundColor: '#1e293b', color: '#fff' }}>
                <th style={{ padding: '14px' }}>वीडियो नाम</th>
                <th style={{ padding: '14px' }}>प्राप्त अंक</th>
                <th style={{ padding: '14px' }}>स्थिति</th>
                <th style={{ padding: '14px' }}>एक्शन</th>
              </tr>
            </thead>
            <tbody>
              {watchedVideosList.map((video) => {
                const testResult = userResults.find(r => 
                    String(r.videoId).trim() === String(video.videoId).trim() && 
                    (r.passed === true || r.passed === 'true')
                );

                return (
                  <tr key={video.videoId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '14px' }}>[{video.videoId}] {video.title}</td>
                    <td style={{ padding: '14px', textAlign: 'center' }}>{testResult ? testResult.score : '—'}</td>
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      {testResult ? 'PASSED ✅' : 'PENDING ⏳'}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <button onClick={() => handleStartTest(video)}>
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
