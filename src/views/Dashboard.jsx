import React, { useState, useEffect } from 'react';
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
  
  // 📱 Mobile responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // स्क्रीन साइज मॉनिटर करने के लिए
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🔄 [DATABASE AUTO-SYNC]
  useEffect(() => {
    const fetchLatestUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) { setIsLoading(false); return; }
      try {
        const response = await axios.get('https://training-ewpp-backend.onrender.com/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.success) {
          setUser(response.data.user);
          if (setGlobalUser) setGlobalUser(response.data.user);
        }
      } catch (err) { console.error("Dashboard API Error:", err); }
      finally { setIsLoading(false); }
    };
    fetchLatestUserData();
  }, []);
  
  if (isLoading) {
    return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0f172a', color: '#fff' }}><h2>Loading...</h2></div>;
  }

  const results = user?.quizResults || [];
  const handleBackToCourseFromQuiz = () => { setIsQuizActiveInPlayer(false); localStorage.removeItem('autoStartQuiz'); window.location.reload(); };
  const handleQuizStateChange = (isActive) => setIsQuizActiveInPlayer(isActive);

  return (
    <ProgressProvider user={user} setUser={setUser}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        <Header 
          user={user} onLogout={onLogout} onProfileClick={onProfileClick} 
          onTestListClick={() => { setIsQuizActiveInPlayer(false); setCurrentView('tests'); }} 
          onHomeClick={() => { setIsQuizActiveInPlayer(false); setCurrentView('training'); }}
          isQuizActive={isQuizActiveInPlayer} onBackFromQuiz={handleBackToCourseFromQuiz}
        />
        
        {/* 🚀 RESPONSIVE MAIN CONTAINER */}
        <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row', // 📱 मोबाइल पर कॉलम, डेस्कटॉप पर रो
            flex: 1, 
            overflow: 'hidden' 
        }}>
          
          {/* 📱 मोबाइल YouTube View Logic */}
          {currentView === 'training' ? (
             isMobile ? (
               // मोबाइल लेआउट: वीडियो ऊपर, साइडबार (मॉड्यूल) नीचे
               <>
                 <div style={{ height: '30%', minHeight: '220px', width: '100%' }}>
                   <VideoPlayer onQuizStateChange={handleQuizStateChange} onQuizSubmitSuccess={(r) => { const u = { ...user, quizResults: r }; setUser(u); if(setGlobalUser) setGlobalUser(u); }} />
                 </div>
                 <div style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid #ddd' }}>
                   <Sidebar />
                 </div>
               </>
             ) : (
               // डेस्कटॉप लेआउट: साइडबार बाएं, वीडियो दाएं
               <>
                 {!isQuizActiveInPlayer && <Sidebar />}
                 <div style={{ flex: 1, overflowY: 'auto' }}>
                    <VideoPlayer onQuizStateChange={handleQuizStateChange} onQuizSubmitSuccess={(r) => { const u = { ...user, quizResults: r }; setUser(u); if(setGlobalUser) setGlobalUser(u); }} />
                 </div>
               </>
             )
          ) : (
             // बाकी व्यूज (Tests/Stats)
             <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                {currentView === 'tests' && <TestListPage user={user} onBack={() => setCurrentView('training')} />}
                {currentView === 'stats' && (
                  <div style={{ background: '#fff', padding: '20px', borderRadius: '10px' }}>
                    <h2>📊 परफॉरमेंस</h2>
                    {results.map((res, i) => <div key={i}>{res.videoId}: {res.score}</div>)}
                  </div>
                )}
             </div>
          )}

        </div>
      </div>
    </ProgressProvider>
  );
}
