import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import VideoPlayer from '../components/VideoPlayer';
import TestListPage from '../views/TestListPage'; 
import { ProgressProvider } from '../context/ProgressContext';

export default function Dashboard({ user, setUser, onLogout, onProfileClick }) {
  const [currentView, setCurrentView] = useState('training');
  const [isQuizActiveInPlayer, setIsQuizActiveInPlayer] = useState(false);

  const results = user?.quizResults || [];

  const handleBackToCourseFromQuiz = () => {
    setIsQuizActiveInPlayer(false);
    window.location.reload(); 
  };

  return (
    <ProgressProvider user={user} setUser={setUser}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>
        
        <Header 
          user={user} 
          onLogout={onLogout} 
          onProfileClick={onProfileClick} 
          onTestListClick={() => { setIsQuizActiveInPlayer(false); setCurrentView('tests'); }} 
          onHomeClick={() => { setIsQuizActiveInPlayer(false); setCurrentView('training'); }} 
        />
        
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* 🚨 साइडबार अब दोनों कंडीशन (मैनुअल या ऑटोमैटिक टेस्ट) में सेफली हाइड रहेगा */}
          {currentView !== 'tests' && !isQuizActiveInPlayer && <Sidebar />}
          
          <div style={{ flex: 1, backgroundColor: '#f8fafc', overflowY: 'auto' }}>
            
            {currentView === 'training' && (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                
                {isQuizActiveInPlayer && (
                  <div style={{ padding: '15px 20px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center' }}>
                    <button onClick={handleBackToCourseFromQuiz} style={{ background: '#0284c7', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                      ◀️ वापस कोर्स पर जाएँ
                    </button>
                    <span style={{ marginLeft: '15px', color: '#64748b', fontSize: '14px' }}>(असेसमेंट मोड एक्टिवेटेड)</span>
                  </div>
                )}

                <VideoPlayer onQuizStateChange={(isActive) => setIsQuizActiveInPlayer(isActive)} />
              </div>
            )}

            {currentView === 'tests' && (
              <TestListPage user={user} onBack={() => setCurrentView('training')} />
            )}

            {currentView === 'stats' && (
              <div style={{ padding: '30px' }}>
                {/* सांख्यिकी तालिका */}
                <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '900px', margin: '0 auto 20px auto' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: '700' }}>📊 आपका ट्रेनिंग परफॉरमेंस डैशबोर्ड</h2>
                  <button onClick={() => setCurrentView('training')} style={{ background: '#0284c7', color: '#fff', padding: '10px 18px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>◀️ वापस कोर्स पर जाएँ</button>
                </div>
                <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
                  {results.length === 0 ? <p>कोई टेस्ट रिकॉर्ड नहीं मिला।</p> : 
                    <table style={{ width: '100%', textAlign: 'left' }}>
                      <thead><tr><th>वीडियो कोड</th><th>स्कोर</th><th>कुल प्रश्न</th><th>स्थिति</th></tr></thead>
                      <tbody>
                        {results.map((res, i) => (
                          <tr key={i}><td>{res.videoId}</td><td>{res.score}</td><td>{res.totalQuestions}</td><td>{res.passed ? 'PASSED ✅' : 'FAILED ❌'}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  }
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </ProgressProvider>
  );
}
