import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios'; 
import Loader from '../components/Loader'; 

export const ProgressContext = createContext();

export const ProgressProvider = ({ children, user, setUser }) => {
  const [modules, setModules] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  
  // 🛡️ सेफगार्ड स्टेट्स
  const [completedVideos, setCompletedVideos] = useState(() => {
    return Array.isArray(user?.completedVideos) ? user.completedVideos : [];
  });
  const [currentUnlockedVideo, setCurrentUnlockedVideo] = useState(user?.currentUnlockedVideo || "m1s1-v1");
  const [loading, setLoading] = useState(true);
  
  // 🔒 स्क्रीन लॉक करने के लिए स्टेट
  const [globalLoading, setGlobalLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // 🎯 बेस यूआरएल
  const BACKEND_URL = "https://training-ewpp-backend.onrender.com/api";

  // यूज़र स्टेट चेंज होने पर प्रोग्रेस को सिंक रखना
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
        // मुख्य रूप से /api/modules पर ट्रम्प करेगा
        const response = await axios.get(`${BACKEND_URL}/modules`, config);
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          setModules(response.data);
          
          const firstModule = response.data[0];
          let firstVideo = null;
          
          if (firstModule?.subModules && Array.isArray(firstModule.subModules) && firstModule.subModules.length > 0) {
            const firstSubModule = firstModule.subModules[0];
            if (firstSubModule?.videos && Array.isArray(firstSubModule.videos) && firstSubModule.videos.length > 0) {
              firstVideo = firstSubModule.videos[0];
            }
          } else if (firstModule?.videos && Array.isArray(firstModule.videos) && firstModule.videos.length > 0) {
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

    if (user?.token || localStorage.getItem('token')) {
      fetchModules();
    }
  }, [user?.token]);

  // 1️⃣ वीडियो प्रोग्रेस अपडेट
  const updateProgressOnBackend = async (videoId) => {
    try {
      setLoadingMessage("आपकी प्रोग्रेस सेव की जा रही है...");
      setGlobalLoading(true); 

      const token = user?.token || localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.post(`${BACKEND_URL}/update-progress`, { videoId }, config);
      
      if (response.data) {
        const newCompleted = Array.isArray(response.data.completedVideos) ? response.data.completedVideos : [];
        const newUnlocked = response.data.currentUnlockedVideo || "m1s1-v1";

        setCompletedVideos(newCompleted);
        setCurrentUnlockedVideo(newUnlocked);
        
        setUser(prevUser => {
          const updated = { 
            ...prevUser, 
            completedVideos: newCompleted, 
            currentUnlockedVideo: newUnlocked 
          };
          localStorage.setItem('partnerUser', JSON.stringify(updated));
          return updated;
        });
        
        return response.data;
      }
    } catch (error) {
      console.error("प्रोग्रेस अपडेट करने में फेल:", error);
    } finally {
      setGlobalLoading(false); 
    }
  };

  // 2️⃣ क्विज़ सबमिशन (स्मार्ट राउट फॉलबैक के साथ फिक्स्ड 🚀)
  const submitQuizOnBackend = async (videoId, answersArray) => {
    try {
      setLoadingMessage("आपके उत्तरों की जांच की जा रही है, कृपया रुकें...");
      setGlobalLoading(true); 

      const token = user?.token || localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = { videoId, answers: answersArray };

      let response;
      try {
        // ट्राय 1: पहले सीधे /api/submit-quiz पर भेजकर देखते हैं
        response = await axios.post(`${BACKEND_URL}/submit-quiz`, payload, config);
      } catch (err) {
        // ट्राय 2: अगर पहला रूट 404 मारता है, तो तुरंत बैकअप रूट /api/training/submit-quiz पर भेजेगा!
        if (err.response && err.response.status === 404) {
          console.log("[Route Redirect] /api/submit-quiz नहीं मिला, बैकअप राउट आज़मा रहे हैं...");
          response = await axios.post(`${BACKEND_URL}/training/submit-quiz`, payload, config);
        } else {
          throw err; // अगर 404 के अलावा कोई और एरर है तो उसे कैच में भेजें
        }
      }

      if (response && response.data) {
        const newCompleted = Array.isArray(response.data.completedVideos) ? response.data.completedVideos : [];
        const newUnlocked = response.data.currentUnlockedVideo || "m1s1-v1";
        const newQuizResults = Array.isArray(response.data.quizResults) ? response.data.quizResults : [];

        setCompletedVideos(newCompleted);
        setCurrentUnlockedVideo(newUnlocked);
        
        setUser(prevUser => {
          const updated = {
            ...prevUser,
            completedVideos: newCompleted,
            currentUnlockedVideo: newUnlocked,
            quizResults: newQuizResults 
          };
          localStorage.setItem('partnerUser', JSON.stringify(updated));
          return updated;
        });
        
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
      modules: modules || [],
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
