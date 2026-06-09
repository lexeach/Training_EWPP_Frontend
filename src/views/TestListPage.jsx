// frontend/src/views/TestListPage.jsx
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressContext } from '../context/ProgressContext';

export default function TestListPage({ user }) {
  const navigate = useNavigate();
  const { completedVideos, modules, setCurrentVideo } = useContext(ProgressContext);

  // 💡 उन सभी वीडियो की फ्लैट लिस्ट तैयार करना जिन्हें यूजर देख चुका है
  const allVideos = modules.flatMap(m => m.subModules.flatMap(sm => sm.videos));
  const watchedVideosList = allVideos.filter(v => completedVideos.includes(v.videoId));

  const handleStartTest = (video) => {
    // 1. कांटेक्स्ट में इस वीडियो को करंट वीडियो सेट करें
    setCurrentVideo(video);
    // 2. यूजर को वापस कोर्स मुख्य पेज पर भेजें जहाँ टेस्ट लोड हो जाएगा
    navigate('/'); 
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>📝 आपकी ऑनलाइन टेस्ट लिस्ट ({watchedVideosList.length})</h2>
        <button 
          onClick={() => navigate('/')} 
          style={{ backgroundColor: '#475569', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
        >
          ◀ वापस कोर्स पर जाएँ
        </button>
      </div>

      <p style={{ color: '#64748b', marginBottom: '25px' }}>
        यहाँ आपके द्वारा पूरे किए गए वीडियोज़ के टेस्ट उपलब्ध हैं। आप जब चाहें पेंडिंग टेस्ट शुरू कर सकते हैं।
      </p>

      {watchedVideosList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4px', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
          अभी आपने कोई वीडियो पूरा नहीं किया है। टेस्ट देने के लिए पहले वीडियो पूरा देखें।
        </div>
      ) : (
        <div style={{ backgroundColor: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#1e293b', color: '#fff' }}>
                <th style={{ padding: '14px' }}>वीडियो कोड / नाम</th>
                <th style={{ padding: '14px' }}>प्राप्त अंक (Score)</th>
                <th style={{ padding: '14px' }}>कुल प्रश्न</th>
                <th style={{ padding: '14px' }}>स्थिति (Status)</th>
                <th style={{ padding: '14px' }}>एक्शन</th>
              </tr>
            </thead>
            <tbody>
              {watchedVideosList.map((video) => {
                // चेक करें कि मोंगोडीबी से आए यूजर डेटा में इसका टेस्ट पास रिजल्ट है या नहीं
                const testResult = user?.quizResults?.find(r => r.videoId === video.videoId && r.passed === true);

                return (
                  <tr key={video.videoId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '14px', fontWeight: '500' }}>
                      <span style={{ color: '#0284c7', marginRight: '6px' }}>[{video.videoId}]</span> 
                      {video.title}
                    </td>
                    <td style={{ padding: '14px', fontWeight: 'bold', color: testResult ? 'green' : '#64748b' }}>
                      {testResult ? testResult.score : '—'}
                    </td>
                    <td style={{ padding: '14px' }}>
                      {testResult ? testResult.totalQuestions : '—'}
                    </td>
                    <td style={{ padding: '14px' }}>
                      {testResult ? (
                        <span style={{ color: 'green', backgroundColor: '#dcfce7', padding: '4px 8px', borderRadius: '4px', fontWeight: '600', fontSize: '13px' }}>
                          PASSED ✅
                        </span>
                      ) : (
                        <span style={{ color: '#b45309', backgroundColor: '#fef3c7', padding: '4px 8px', borderRadius: '4px', fontWeight: '600', fontSize: '13px' }}>
                          PENDING ⏳
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px' }}>
                      {testResult ? (
                        <button disabled style={{ backgroundColor: '#cbd5e1', color: '#94a3b8', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'not-allowed' }}>
                          Completed
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleStartTest(video)}
                          style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
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
