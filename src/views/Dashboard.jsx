// frontend/src/views/Dashboard.jsx
import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import VideoPlayer from '../components/VideoPlayer';
import { ProgressProvider } from '../context/ProgressContext';

export default function Dashboard({ user, setUser, onLogout }) {
  // 🔄 स्टेट ट्रैक करने के लिए कि यूजर अभी 'training' मोड में है या अपना 'stats' (परफॉर्मेंस डैशबोर्ड) देख रहा है
  const [currentView, setCurrentView] = useState('training');

  // यूजर के क्विज़ परिणाम (सेफ फॉलबैक के साथ)
  const results = user?.quizResults || [];

  return (
    <ProgressProvider user={user} setUser={setUser}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>
        
        {/* 1. TOP BAR (प्रोफाइल क्लिक पर व्यू चेंज करेंगे, और लॉगआउट पर वापस ट्रेनिंग सेट करेंगे) */}
        <Header 
        user={user} 
        onLogout={onLogout} 
        onProfileClick={onProfileClick} 
        onTestListClick={onTestListClick} // 👈 यह यहाँ जोड़ें
      />
        
        {/* MAIN BODY CONTAINER */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* 2. LEFT SIDEBAR (Modules & Accordion) */}
          <Sidebar />
          
          {/* 3. RIGHT MAIN FRAME (कंडीशनल रेंडरिंग: व्यू के आधार पर वीडियो या परफॉर्मेंस टेबल दिखेगी) */}
          {currentView === 'training' ? (
            // नॉर्मल मोड: वीडियो प्लेयर और गाइडलाइंस
            <VideoPlayer />
          ) : (
            // 📊 असेसमेंट परफॉर्मेंस डैशबोर्ड मोड (खूबसूरत और आई-कंफर्टेबल टेबल यूआई)
            <div style={{ flex: 1, padding: '30px', background: '#f8fafc', overflowY: 'auto' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', maxWidth: '900px', margin: '0 auto 20px auto' }}>
                <div>
                  <h2 style={{ color: '#0f172a', margin: '0 0 5px 0', fontSize: '22px', fontWeight: '700' }}>📊 आपका ट्रेनिंग परफॉरमेंस डैशबोर्ड</h2>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>यहाँ आपके द्वारा दिए गए सभी ऑनलाइन असेसमेंट के स्कोर सुरक्षित हैं।</p>
                </div>
                <button 
                  onClick={() => setCurrentView('training')}
                  style={{ background: '#0284c7', color: '#fff', padding: '10px 18px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)' }}
                >
                  ◀️ वापस कोर्स पर जाएँ
                </button>
              </div>
              
              <div style={{ background: '#ffffff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', maxWidth: '900px', margin: '0 auto' }}>
                {results.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    <span style={{ fontSize: '40px' }}>📝</span>
                    <p style={{ marginTop: '10px', fontWeight: '500' }}>आपने अभी तक कोई ऑनलाइन असेसमेंट टेस्ट नहीं दिया है।</p>
                    <p style={{ fontSize: '13px', color: '#94a3b8' }}>वीडियो पूरा देखने के बाद आपका टेस्ट ऑटोमैटिक शुरू हो जाएगा।</p>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#1e293b', color: '#ffffff' }}>
                        <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600' }}>वीडियो कोड / आईडी</th>
                        <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600' }}>प्राप्त अंक (Score)</th>
                        <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600' }}>कुल प्रश्न</th>
                        <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600' }}>स्थिति (Status)</th>
                        <th style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600' }}>दिनांक</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((res, index) => (
                        <tr key={res._id || index} style={{ borderBottom: '1px solid #f1f5f9', background: index % 2 === 0 ? '#ffffff' : '#f8fafc', transition: 'background 0.2s' }}>
                          <td style={{ padding: '16px 20px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>{res.videoId}</td>
                          <td style={{ padding: '16px 20px', fontWeight: '700', fontSize: '15px', color: res.passed ? '#166534' : '#991b1b' }}>{res.score}</td>
                          <td style={{ padding: '16px 20px', color: '#475569', fontSize: '14px' }}>{res.totalQuestions}</td>
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{ 
                              background: res.passed ? '#dcfce7' : '#fee2e2', 
                              color: res.passed ? '#15803d' : '#b91c1c', 
                              padding: '5px 12px', 
                              borderRadius: '12px', 
                              fontSize: '11.5px', 
                              fontWeight: '700',
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}>
                              {res.passed ? 'PASSED ✅' : 'FAILED ❌'}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '13.5px' }}>
                            {res.attemptedAt ? new Date(res.attemptedAt).toLocaleDateString('hi-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '---'}
                          </td>
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
    </ProgressProvider>
  );
}
