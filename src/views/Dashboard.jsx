// frontend/src/views/Dashboard.jsx
import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import VideoPlayer from '../components/VideoPlayer';
import TestListPage from '../views/TestListPage'; // 🟢 इम्पोर्टेड
import { ProgressProvider } from '../context/ProgressContext';

export default function Dashboard({ user, setUser, onLogout, onProfileClick }) {
  // 🔄 स्टेट: 'training' (वीडियो प्लेयर), 'tests' (टेस्ट लिस्ट), या 'stats' (परफॉर्मेंस टेबल)
  const [currentView, setCurrentView] = useState('training');

  const results = user?.quizResults || [];

  return (
    <ProgressProvider user={user} setUser={setUser}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>
        
        {/* 1. TOP BAR */}
        <Header 
          user={user} 
          onLogout={onLogout} 
          onProfileClick={onProfileClick} 
          onTestListClick={() => setCurrentView('tests')} // 🟢 टेस्ट बटन पर क्लिक करने पर राइट साइड में खुलेगा
          onHomeClick={() => setCurrentView('training')} 
        />
        
        {/* MAIN BODY CONTAINER */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* 2. LEFT SIDEBAR */}
          <Sidebar />
          
          {/* 3. RIGHT MAIN FRAME (सुरक्षित कंडीशनल रेंडरिंग) */}
          <div style={{ flex: 1, backgroundColor: '#f8fafc', overflowY: 'auto' }}>
            
            {currentView === 'training' && (
              <VideoPlayer />
            )}

            {currentView === 'tests' && (
              // 📝 सेफ कंटेनर में टेस्ट लिस्ट पेज रेंडर किया
              <TestListPage 
                user={user} 
                onBack={() => setCurrentView('training')} 
              />
            )}

            {currentView === 'stats' && (
              // 📊 असेसमेंट परफॉर्मेंस डैशबोर्ड मोड
              <div style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', maxWidth: '900px', margin: '0 auto 20px auto' }}>
                  <div>
                    <h2 style={{ color: '#0f172a', margin: '0 0 5px 0', fontSize: '22px', fontWeight: '700' }}>📊 आपका ट्रेनिंग परफॉरमेंस डैशबोर्ड</h2>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>यहाँ आपके द्वारा दिए गए सभी ऑनलाइन असेसमेंट के स्कोर सुरक्षित हैं।</p>
                  </div>
                  <button 
                    onClick={() => setCurrentView('training')}
                    style={{ background: '#0284c7', color: '#fff', padding: '10px 18px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                  >
                    ◀️ वापस कोर्स पर जाएँ
                  </button>
                </div>
                
                <div style={{ background: '#ffffff', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', maxWidth: '900px', margin: '0 auto' }}>
                  {results.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                      <p style={{ fontWeight: '500' }}>आपने अभी तक कोई ऑनलाइन असेसमेंट test नहीं दिया है।</p>
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#1e293b', color: '#ffffff' }}>
                          <th style={{ padding: '16px 20px' }}>वीडियो कोड / आईडी</th>
                          <th style={{ padding: '16px 20px' }}>प्राप्त अंक (Score)</th>
                          <th style={{ padding: '16px 20px' }}>कुल प्रश्न</th>
                          <th style={{ padding: '16px 20px' }}>स्थिति (Status)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((res, index) => (
                          <tr key={res._id || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '16px 20px', fontWeight: '600' }}>{res.videoId}</td>
                            <td style={{ padding: '16px 20px', fontWeight: '700', color: res.passed ? '#166534' : '#991b1b' }}>{res.score}</td>
                            <td style={{ padding: '16px 20px' }}>{res.totalQuestions}</td>
                            <td style={{ padding: '16px 20px' }}>{res.passed ? 'PASSED ✅' : 'FAILED ❌'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

          </div>
          
        </div>
      </div>
    </ProgressProvider>
  );
}
