// frontend/src/context/ProgressContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const ProgressContext = createContext();

export const ProgressProvider = ({ children, user, setUser }) => {
  const [modules, setModules] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [completedVideos, setCompletedVideos] = useState(user?.completedVideos || []);
  const [currentUnlockedVideo, setCurrentUnlockedVideo] = useState(user?.currentUnlockedVideo || "m1-v1");
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = "https://training-ewpp-backend.onrender.com/api";

  // frontend/src/context/ProgressContext.jsx (सिर्फ समस्या पकड़ने के लिए अस्थायी अपडेट)
useEffect(() => {
  const fetchModules = async () => {
    try {
      console.log("📡 Fetching modules from:", `${BACKEND_URL}/modules`);
      const response = await axios.get(`${BACKEND_URL}/modules`);
      
      if (response.data && response.data.length > 0) {
        setModules(response.data);
        
        // 🔴 केवल इस लाइन को ध्यान से देखें: यह पहले मॉड्यूल की सभी असली चाबियाँ (Keys) प्रिंट कर देगा
        console.log("👉 REAL KEYS INSIDE DATABASE OBJECT:", Object.keys(response.data[0]));
        console.log("👉 REAL CONTENT OF FIRST MODULE:", JSON.stringify(response.data[0], null, 2));
      }
      setLoading(false);
    } catch (error) {
      console.error("Modules fetch करने में एरर:", error);
      setLoading(false);
    }
  };
  fetchModules();
}, []);
  const updateProgressOnBackend = async (videoId) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };
      const response = await axios.post(`${BACKEND_URL}/progress/update`, { videoId }, config);
      setCompletedVideos(response.data.completedVideos);
      setCurrentUnlockedVideo(response.data.currentUnlockedVideo);
      
      const updatedUser = { 
        ...user, 
        completedVideos: response.data.completedVideos, 
        currentUnlockedVideo: response.data.currentUnlockedVideo 
      };
      setUser(updatedUser);
      localStorage.setItem('partnerUser', JSON.stringify(updatedUser));
      return response.data;
    } catch (error) {
      console.error("प्रोग्रेस अपडेट करने में फेल:", error);
    }
  };

  return (
    <ProgressContext.Provider value={{
      modules,
      currentVideo,
      setCurrentVideo,
      completedVideos,
      currentUnlockedVideo,
      updateProgressOnBackend,
      loading
    }}>
      {children}
    </ProgressContext.Provider>
  );
};
