// frontend/src/views/Dashboard.jsx
import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import VideoPlayer from '../components/VideoPlayer';
import { ProgressProvider } from '../context/ProgressContext';

export default function Dashboard({ user, setUser, onLogout }) {
  return (
    // प्रोग्रेस प्रोवाइडर में यूजर स्टेट पास कर रहे हैं ताकि पूरे डैशबोर्ड में डेटा लाइव रहे
    <ProgressProvider user={user} setUser={setUser}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        {/* 1. TOP BAR */}
        <Header user={user} onLogout={onLogout} />
        
        {/* MAIN BODY CONTAINER */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* 2. LEFT SIDEBAR (Modules & Accordion) */}
          <Sidebar />
          
          {/* 3. RIGHT MAIN FRAME (Video Player & Guidelines) */}
          <VideoPlayer />
          
        </div>
      </div>
    </ProgressProvider>
  );
}