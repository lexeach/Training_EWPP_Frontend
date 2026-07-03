// frontend/src/views/Dashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import VideoPlayer from '../components/VideoPlayer';
import TestListPage from '../views/TestListPage'; 
import { ProgressProvider, ProgressContext } from '../context/ProgressContext';
import axios from 'axios'; 

// 🟢 नया कंपोनेंट: जो Provider के अंदर के loading state को चेक करेगा
const DashboardContent = ({ user, setUser, setGlobalUser, onLogout, onProfileClick, isMobile, currentView, setCurrentView, isQuizActiveInPlayer, setIsQuizActiveInPlayer, handleBackToCourseFromQuiz, handleQuizStateChange, handleVideoSelect }) => {
  const { loading: isProviderLoading } = useContext(ProgressContext);

  // 🟢 जब तक Provider लोड नहीं हो जाता, पूरी स्क्रीन पर Loading दिखाएं
  if (isProviderLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: '#fff', fontSize: '20px' }}>
        <h2>Loading your training...</h2>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: isMobile ? 'auto' : '100vh', overflow: isMobile ? 'visible' : 'hidden', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc' }}>
      <Header user={user} onLogout={onLogout} onProfileClick={onProfileClick} onTestListClick={() => { setIsQuizActiveInPlayer(false); setCurrentView('tests'); }} onHomeClick={() => { setIsQuizActiveInPlayer(false); setCurrentView('training'); }} isQuizActive={isQuizActiveInPlayer} onBackFromQuiz={handleBackToCourseFromQuiz} />
      
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', flex: isMobile ? 'none' : 1, height: isMobile ? 'auto' : 'calc(100vh - 56px)', overflow: isMobile ? 'visible' : 'hidden', width: '100%' }}>
        {currentView === 'training' && (
          <>
            {!isQuizActiveInPlayer && (
              <div style={{ width: isMobile ? '100%' : '320px', order: isMobile ? 2 : 1, height: isMobile ? 'auto' : '100%', overflowY: isMobile ? 'visible' : 'auto', backgroundColor: '#ffffff', borderTop: isMobile ? '1px solid #e2e8f0' : 'none', borderRight: isMobile ? 'none' : '1px solid #e2e8f0', flexShrink: 0 }}>
                <Sidebar onVideoSelect={handleVideoSelect} isMobile={isMobile} user={user} />
              </div>
            )}
            <div style={{ flex: isMobile ? '0 0 auto' : '1', width: isMobile ? '100%' : 'auto', order: isMobile ? 1 : 2, background: '#000', position: 'relative', height: isMobile ? 'auto' : '100%', overflowY: isMobile ? 'visible' : 'auto' }}>
              <VideoPlayer onQuizStateChange={handleQuizStateChange} onProfileClick={onProfileClick} onQuizSubmitSuccess={(updatedQuizResults) => { const updatedUser = { ...user, quizResults: updatedQuizResults }; setUser(updatedUser); if (setGlobalUser) setGlobalUser(updatedUser); }} />
            </div>
          </>
        )}
        {currentView !== 'training' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '15px' : '30px', height: isMobile ? 'auto' : '100%' }}>
            {currentView === 'tests' && <TestListPage user={user} onBack={() => setCurrentView('training')} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default function Dashboard({ user: initialUser, setUser: setGlobalUser, onLogout, onProfileClick }) {
  const [user, setUser] = useState(initialUser);
  const [currentView, setCurrentView] = useState('training');
  const [isQuizActiveInPlayer, setIsQuizActiveInPlayer] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchLatestUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) { setIsLoading(false); return; }
      try {
        const response = await axios.get('https://training-ewpp-backend.onrender.com/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        if (response.data?.success) { setUser(response.data.user); if (setGlobalUser) setGlobalUser(response.data.user); }
      } catch (err) { console.error("Dashboard API Error:", err); }
      finally { setIsLoading(false); }
    };
    fetchLatestUserData();
  }, []);

  if (isLoading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><h2>Loading...</h2></div>;

  return (
    <ProgressProvider user={user} setUser={setUser}>
      <DashboardContent 
        user={user} setUser={setUser} setGlobalUser={setGlobalUser} onLogout={onLogout} onProfileClick={onProfileClick} 
        isMobile={isMobile} currentView={currentView} setCurrentView={setCurrentView} 
        isQuizActiveInPlayer={isQuizActiveInPlayer} setIsQuizActiveInPlayer={setIsQuizActiveInPlayer}
        handleBackToCourseFromQuiz={() => { setIsQuizActiveInPlayer(false); localStorage.removeItem('autoStartQuiz'); window.location.reload(); }}
        handleQuizStateChange={setIsQuizActiveInPlayer}
        handleVideoSelect={() => isMobile && window.scrollTo({ top: 0, behavior: 'smooth' })}
      />
    </ProgressProvider>
  );
}
