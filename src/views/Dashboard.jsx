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

  // 🟢 मोबाइल पर वीडियो सेलेक्ट होने पर ब्राउज़र विंडो को टॉप पर स्क्रॉल करने वाला फंक्शन
  const handleVideoSelect = () => {
    if (isMobile) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <ProgressProvider user={user} setUser={setUser}>
      {/* 🟢 1. मुख्य आउटर डिब्बा - डेस्कटॉप पर 100vh फिक्स, मोबाइल पर आज़ाद (auto) */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: isMobile ? 'auto' : '100vh', 
        overflow: isMobile ? 'visible' : 'hidden', 
        fontFamily: 'system-ui, sans-serif', 
        backgroundColor: '#f8fafc' 
      }}>
        
        {/* TOP HEADER */}
        <Header 
          user={user} 
          onLogout={onLogout} 
          onProfileClick={onProfileClick} 
          onTestListClick={() => { setIsQuizActiveInPlayer(false); setCurrentView('tests'); }} 
          onHomeClick={() => { setIsQuizActiveInPlayer(false); setCurrentView('training'); }}
          isQuizActive={isQuizActiveInPlayer}
          onBackFromQuiz={handleBackToCourseFromQuiz}
        />
        
        {/* 🟢 2. MAIN HUB - डेस्कटॉप पर flex: 1 और overflow: hidden रहेगा ताकि लेआउट न टूटे */}
        <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row', 
            flex: isMobile ? 'none' : 1, 
            height: isMobile ? 'auto' : 'calc(100% - 56px)', // हेडर की हाइट हटाकर बाकी बची पूरी जगह डेस्कटॉप पर लेगा
            overflow: isMobile ? 'visible' : 'hidden'
        }}>
          
          {currentView === 'training' && (
            <>
              {/* 📹 VIDEO PLAYER (डेस्कटॉप पर दाईं ओर फ्लेक्स लेगा, मोबाइल पर ऊपर रहेगा) */}
              <div style={{ 
                  flex: isMobile ? '0 0 auto' : '1', 
                  width: '100%',
                  order: isMobile ? 1 : 2, 
                  background: '#000',
                  position: 'relative',
                  height: isMobile ? 'auto' : '100%',
                  overflowY: isMobile ? 'visible' : 'auto' // डेस्कटॉप पर अगर कंटेंट बड़ा हो तो प्लेयर के अंदर स्क्रॉल हो सके
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

              {/* 📑 MODULE LIST / SIDEBAR (डेस्कटॉप पर बाईं ओर 320px फिक्स स्क्रॉल, मोबाइल पर नीचे फुल विड्थ) */}
              {!isQuizActiveInPlayer && (
                <div style={{ 
                    width: isMobile ? '100%' : '320px', 
                    order: isMobile ? 2 : 1,
                    height: isMobile ? 'auto' : '100%', // डेस्कटॉप पर पैरेंट की पूरी हाइट लेगा
                    overflowY: isMobile ? 'visible' : 'auto', // डेस्कटॉप पर खुद का स्क्रॉल एक्टिव रहेगा
                    backgroundColor: '#ffffff',
                    borderTop: isMobile ? '1px solid #e2e8f0' : 'none',
                    borderRight: isMobile ? 'none' : '1px solid #e2e8f0',
                    flexShrink: 0
                }}>
                  <Sidebar onVideoSelect={handleVideoSelect} isMobile={isMobile} />
                </div>
              )}
            </>
          )}

          {/* बाकी व्यूज के लिए (Tests / Stats) */}
          {currentView !== 'training' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '15px' : '30px', height: isMobile ? 'auto' : '100%' }}>
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
