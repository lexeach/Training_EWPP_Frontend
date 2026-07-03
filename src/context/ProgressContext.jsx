// frontend/src/context/ProgressContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios'; 
import Loader from '../components/Loader'; 

export const ProgressContext = createContext();

export const ProgressProvider = ({ children, user, setUser }) => {
  const [modules, setModules] = useState([]);
  // 🟢 FIXED: null के बजाय undefined ताकि VideoPlayer समझ सके कि डेटा अभी नहीं आया है
  const [currentVideo, setCurrentVideo] = useState(undefined); 
  
  const [completedVideos, setCompletedVideos] = useState(() => {
    return Array.isArray(user?.completedVideos) ? user.completedVideos : [];
  });
  const [currentUnlockedVideo, setCurrentUnlockedVideo] = useState(user?.currentUnlockedVideo || "m1s1-v1");
  const [loading, setLoading] = useState(true);
  
  const [globalLoading, setGlobalLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const BACKEND_URL = "https://training-ewpp-backend.onrender.com/api";

  useEffect(() => {
    if (user) {
      if (Array.isArray(user.completedVideos)) setCompletedVideos(user.completedVideos);
      if (user.currentUnlockedVideo) setCurrentUnlockedVideo(user.currentUnlockedVideo);
    }
  }, [user]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const token = user?.token || localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`${BACKEND_URL}/modules`, config);
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          setModules(response.data);
          
          // पहला वीडियो ढूँढें
          const firstModule = response.data[0];
          let firstVideo = null;
          
          if (firstModule?.subModules?.[0]?.videos?.[0]) {
            firstVideo = firstModule.subModules[0].videos[0];
          } else if (firstModule?.videos?.[0]) {
            firstVideo = firstModule.videos[0];
          }
          
          // 🟢 अब currentVideo सेट करें
          setCurrentVideo(firstVideo);
        }
        setLoading(false);
      } catch (error) {
        console.error("Modules fetch error:", error);
        setLoading(false);
      }
    };

    if (user?.token || localStorage.getItem('token')) {
      fetchModules();
    }
  }, [user?.token]);

  // प्रोग्रेस अपडेट फंक्शन्स ... (ये आपके पुराने कोड जैसे ही रहेंगे)
  const updateProgressOnBackend = async (videoId) => {
    try {
      setGlobalLoading(true);
      const token = user?.token || localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(`${BACKEND_URL}/update-progress`, { videoId }, config);
      
      if (response.data) {
        const { completedVideos: newCompleted, currentUnlockedVideo: newUnlocked } = response.data;
        setCompletedVideos(newCompleted);
        setCurrentUnlockedVideo(newUnlocked);
        setUser(prev => ({ ...prev, completedVideos: newCompleted, currentUnlockedVideo: newUnlocked }));
        return response.data;
      }
    } catch (error) {
      console.error("Update progress fail:", error);
    } finally {
      setGlobalLoading(false);
    }
  };

  const submitQuizOnBackend = async (videoId, answersArray) => {
    try {
      setGlobalLoading(true);
      const token = user?.token || localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(`${BACKEND_URL}/submit-quiz`, { videoId, answers: answersArray }, config);
      
      if (response && response.data) {
        setUser(prev => ({ ...prev, ...response.data }));
        return response.data;
      }
    } catch (error) {
      console.error("Quiz error:", error);
    } finally {
      setGlobalLoading(false);
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
      submitQuizOnBackend,
      loading,
      user,
      setUser
    }}>
      {globalLoading && <Loader message={loadingMessage} />}
      {children}
    </ProgressContext.Provider>
  );
};
