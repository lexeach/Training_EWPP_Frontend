// frontend/src/context/ProgressContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios'; // ✨ फिक्स: इसे वापस 'axios' पैकेज से इम्पोर्ट कर दिया गया है
import Loader from '../components/Loader'; 

export const ProgressContext = createContext();

export const ProgressProvider = ({ children, user, setUser }) => {
  const [modules, setModules] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [completedVideos, setCompletedVideos] = useState(user?.completedVideos || []);
  const [currentUnlockedVideo, setCurrentUnlockedVideo] = useState(user?.currentUnlockedVideo || "m1s1-v1");
  const [loading, setLoading] = useState(true);
  
  // 🔒 स्क्रीन लॉक करने के लिए स्टेट
  const [globalLoading, setGlobalLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // 🎯 बेस यूआरएल (बैकएंड कंट्रोलर राउट्स के अनुसार)
  const BACKEND_URL = "https://training-ewpp-backend.onrender.com/api/training";

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user?.token || localStorage.getItem('token')}` }
        };
        const response = await axios.get(`${BACKEND_URL}/modules`, config);
        if (response.data && response.data.length > 0) {
          setModules(response.data);
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
          if (!currentVideo && firstVideo) {
            setCurrentVideo(firstVideo);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Modules fetch करने में एरर:", error);
        setLoading(false);
      }
    };
    if (user?.token) {
      fetchModules();
    }
  }, [user?.token]);

  // 1️⃣ वीडियो प्रोग्रेस अपडेट
  const updateProgressOnBackend = async (videoId) => {
    try {
      setLoadingMessage("आपकी प्रोग्रेस सेव की जा रही है...");
      setGlobalLoading(true); 

      const config = { headers: { Authorization: `Bearer ${user?.token || localStorage.getItem('token')}` } };
      
      // ✅ राउट फिक्स: /update-progress
      const response = await axios.post(`${BACKEND_URL}/update-progress`, { videoId }, config);
      
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
    } finally {
      setGlobalLoading(false); 
    }
  };

  // 2️⃣ क्विज़ सबमिशन
  const submitQuizOnBackend = async (videoId, answersArray) => {
    try {
      setLoadingMessage("आपके उत्तरों की जांच की जा रही है, कृपया रुकें...");
      setGlobalLoading(true); 

      const config = {
        headers: { Authorization: `Bearer ${user?.token || localStorage.getItem('token')}` }
      };

      // ✅ राउट फिक्स: /submit-quiz
      const response = await axios.post(`${BACKEND_URL}/submit-quiz`, { 
        videoId, 
        answers: answersArray 
      }, config);

      if (response.data) {
        setCompletedVideos(response.data.completedVideos);
        setCurrentUnlockedVideo(response.data.currentUnlockedVideo);
        
        const updatedUser = {
          ...user,
          completedVideos: response.data.completedVideos,
          currentUnlockedVideo: response.data.currentUnlockedVideo,
          quizResults: response.data.quizResults 
        };
        setUser(updatedUser);
        localStorage.setItem('partnerUser', JSON.stringify(updatedUser));
        return response.data;
      }
    } catch (error) {
      console.error("Quiz Submission Error:", error);
      alert(error.response?.data?.message || "क्विज़ सबमिट करने में कोई समस्या आई।");
      return null;
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
      loading
    }}>
      {globalLoading && <Loader message={loadingMessage} />}
      {children}
    </ProgressContext.Provider>
  );
};
