// frontend/src/views/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import VideoPlayer from '../components/VideoPlayer';
import TestListPage from '../views/TestListPage'; 
import { ProgressProvider } from '../context/ProgressContext';
import axios from 'axios'; 

export default function Dashboard({ user: initialUser, setUser: setGlobalUser, onLogout, onProfileClick }) {
  const [user, setUser] = useState(initialUser);
  const [currentView, setCurrentView] = useState('training');
  const [isQuizActiveInPlayer, setIsQuizActiveInPlayer] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 
  
  // 📱 Mobile View Breakpoint (768px)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // पूरे पेज के स्क्रॉल को कंट्रोल करने के लिए Ref
  const mainScrollContainerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🔄 [DATABASE AUTO-SYNC]
  useEffect(() => {
    const fetchLatestUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await axios.get('https://training-ewpp-backend.onrender.com/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.success) {
          setUser(response.data.user);
          if (setGlobalUser) setGlobalUser(response.data.user);
        }
      } catch (err) {
        console.error("Dashboard API Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLatestUserData();
  }, []);
  
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: '#fff' }}>
        <h2>Loading your data...</h2>
      </div>
    );
  }

  const results = user?.quizResults || [];

  const handleBackToCourseFromQuiz = () => {
    setIsQuizActiveInPlayer(false);
    localStorage.removeItem('autoStartQuiz');
    window.location.reload(); 
  };

  const handleQuizStateChange = (isActive) => {
    setIsQuizActiveInPlayer(isActive);
  };

  // 🟢 लिस्ट में से वीडियो क्लिक करने पर पूरे पेज को वापस टॉप (वीडियो) पर ले जाने वाला फंक्शन
  const handleVideoSelect = () => {
    if (mainScrollContainerRef.current) {
      mainScrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth' // स्मूथ स्क्रॉल एनीमेशन
      });
    }
  };

  return (
    <ProgressProvider user={user} setUser={setUser}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc' }}>
        
        {/* 1. TOP HEADER */}
        <Header 
          user={user} 
          onLogout={onLogout} 
          onProfileClick={onProfileClick} 
          onTestListClick={() => { setIsQuizActiveInPlayer(false); setCurrentView('tests'); }} 
          onHomeClick={() => { setIsQuizActiveInPlayer(false); setCurrentView('training'); }}
          isQuizActive={isQuizActiveInPlayer}
          onBackFromQuiz={handleBackToCourseFromQuiz}
        />
        
        {/* 2. MAIN HUB (यह मुख्य डिब्बा अब मोबाइल पर नॉर्मल स्क्रॉल होगा, वीडियो फ्रीज नहीं रहेगा) */}
        <div 
          ref={mainScrollContainerRef} // 🟢 स्क्रॉल टॉप ट्रैक करने के लिए Ref यहाँ लगाया
          style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row', 
            flex: 1, 
            overflowY: 'auto', // 🟢 मोबाइल पर पूरा हब एक साथ नॉर्मल स्क्रॉल होगा
            overflowX: 'hidden'
          }}
        >
          
          {currentView === 'training' && (
            <>
              {/* 📹 VIDEO PLAYER (नॉर्मल फ्लो में रहेगा, स्क्रॉल करने पर ऊपर चला जाएगा) */}
              <div style={{ 
                  width: '100%',
                  flexShrink: 0,
                  background: '#000',
                  position: 'relative' // 🟢 कोई sticky या fixed नहीं, बिल्कुल नॉर्मल
              }}>
                <VideoPlayer 
                  onQuizStateChange={handleQuizStateChange} 
                  onQuizSubmitSuccess={(updatedQuizResults) => {
                    const updatedUser = { ...user, quizResults: updatedQuizResults };
                    setUser(updatedUser);
                    if (setGlobalUser) setGlobalUser(updatedUser);
                  }}
                />
              </div>

              {/* 📑 MODULE LIST / SIDEBAR (वीडियो के ठीक नीचे सटकर दिखेगा) */}
              {!isQuizActiveInPlayer && (
                <div style={{ 
                    width: '100%', // मोबाइल पर फुल विड्थ
                    backgroundColor: '#ffffff',
                    borderTop: isMobile ? '1px solid #e2e8f0' : 'none',
                    borderRight: isMobile ? 'none' : '1px solid #e2e8f0'
                }}>
                  <Sidebar onVideoSelect={handleVideoSelect} isMobile={isMobile} />
                </div>
              )}
            </>
          )}

          {/* बाकी व्यूज के लिए (Tests / Stats) */}
          {currentView !== 'training' && (
            <div style={{ flex: 1, padding: isMobile ? '15px' : '30px' }}>
              {currentView === 'tests' && (
                <TestListPage user={user} onBack={() => setCurrentView('training')} />
              )}

              {currentView === 'stats' && (
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '900px', margin: '0 auto 20px auto' }}>
                    <h2 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '700' }}>📊 आपका परफॉरमेंस</h2>
                    <button onClick={() => setCurrentView('training')} style={{ background: '#0284c7', color: '#fff', padding: '8px 14px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>◀️ वापस</button>
                  </div>
                  <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '15px', overflowX: 'auto' }}>
                    {results.length === 0 ? <p>कोई टेस्ट रिकॉर्ड नहीं मिला।</p> : 
                      <table style={{ width: '100%', textAlign: 'left', minWidth: '400px' }}>
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
          )}

        </div>
      </div>
    </ProgressProvider>
  );
}
