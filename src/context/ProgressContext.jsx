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

  useEffect(() => {
    const fetchModules = async () => {
      try {
        console.log("📡 Fetching modules from:", `${BACKEND_URL}/modules`);
        const response = await axios.get(`${BACKEND_URL}/modules`);
        
        // 🔴 DEBUG LOG 1: देखें कि बैकएंड असल में क्या डेटा भेज रहा है
        console.log("📦 BACKEND RAW DATA RECV:", response.data);
        
        if (!response.data || !Array.isArray(response.data)) {
          console.error("❌ Error: API did not return an array!");
          setLoading(false);
          return;
        }

        setModules(response.data);
        
        // 🟢 सुपर सेफ चेकिंग लॉजिक
        if (response.data.length > 0) {
          const firstModule = response.data[0];
          console.log("🔍 Checking First Module Structure:", firstModule);
          
          if (firstModule.subModules && firstModule.subModules.length > 0) {
            console.log("🚀 Found 3-Tier Structure (Sub-modules)");
            const firstSubModule = firstModule.subModules[0];
            if (firstSubModule.videos && firstSubModule.videos.length > 0) {
              setCurrentVideo(firstSubModule.videos[0]);
              console.log("🎯 Current Video Set Successfully (3-tier):", firstSubModule.videos[0]);
            }
          } 
          else if (firstModule.videos && firstModule.videos.length > 0) {
            console.log("⚠️ Found Old 2-Tier Structure (Direct Videos)");
            setCurrentVideo(firstModule.videos[0]);
            console.log("🎯 Current Video Set Successfully (2-tier):", firstModule.videos[0]);
          } else {
            console.warn("❓ No videos found anywhere in the first module!");
          }
        }
        
        setLoading(false);
      } catch (error) {
        // 🔴 DEBUG LOG 2: अगर API फेल हो रही है तो यहाँ दिखेगा
        console.error("❌ Modules fetch करने में गंभीर एरर:", error);
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
