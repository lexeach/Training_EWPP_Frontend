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

  // लाइव बैकएंड से सातों मॉड्यूल्स का डेटा फेच करना
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/modules`);
        setModules(response.data);
        
        // डिफ़ॉल्ट रूप से पहला वीडियो सेट करें
        if (response.data.length > 0 && response.data[0].videos.length > 0) {
          setCurrentVideo(response.data[0].videos[0]);
        }
        setLoading(false);
      } catch (error) {
        console.error("Modules fetch करने में एरर:", error);
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  // वीडियो ख़त्म होने पर बैकएंड पर प्रोग्रेस अपडेट करने का फंक्शन
  const updateProgressOnBackend = async (videoId) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };
      
      const response = await axios.post(`${BACKEND_URL}/progress/update`, { videoId }, config);
      
      // स्टेट और लोकलस्टोरेज को नए डेटा के साथ अपडेट करना
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