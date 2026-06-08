// frontend/src/context/ProgressContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios'; // 🟢 फिक्स: सही इम्पोर्ट सेट कर दिया गया है

export const ProgressContext = createContext();

export const ProgressProvider = ({ children, user, setUser }) => {
  const [modules, setModules] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [completedVideos, setCompletedVideos] = useState(user?.completedVideos || []);
  
  // डिफ़ॉल्ट वैल्यू नए आर्किटेक्चर के पहले वीडियो की ID ("m1s1-v1") से सिंक की
  const [currentUnlockedVideo, setCurrentUnlockedVideo] = useState(user?.currentUnlockedVideo || "m1s1-v1");
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = "https://training-ewpp-backend.onrender.com/api";

  useEffect(() => {
    const fetchModules = async () => {
      try {
        console.log("📡 Fetching modules from:", `${BACKEND_URL}/modules`);
        const response = await axios.get(`${BACKEND_URL}/modules`);
        
        if (response.data && response.data.length > 0) {
          setModules(response.data);
          
          // 3-Tier आर्किटेक्चर के अनुसार पहला वीडियो सुरक्षित तरीके से ढूंढना
          const firstModule = response.data[0];
          let firstVideo = null;

          if (firstModule.subModules && firstModule.subModules.length > 0) {
            const firstSubModule = firstModule.subModules[0];
            if (firstSubModule.videos && firstSubModule.videos.length > 0) {
              firstVideo = firstSubModule.videos[0];
            }
          } else if (firstModule.videos && firstModule.videos.length > 0) {
            firstVideo = firstModule.videos[0];
          }

          // अगर यूजर ने अभी तक कोई वीडियो सेलेक्ट नहीं किया है, तो पहला वीडियो ऑटो-लोड करें
          if (!currentVideo && firstVideo) {
            setCurrentVideo(firstVideo);
            console.log("🎯 Auto-loaded first video:", firstVideo.title);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Modules fetch करने में एरर:", error);
        setLoading(false);
      }
    };
    fetchModules();
  }, []); // 🟢 फिक्स: Dependency Array को खाली [] किया ताकि अनचाहा री-रेंडर लूप न बने

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
