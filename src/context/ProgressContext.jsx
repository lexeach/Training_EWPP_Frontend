import React, { createContext, useState, useEffect } from 'react';
import axios from 'react';
import Loader from '../components/Loader'; // 👈 लोडर इम्पोर्ट किया

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

  // 🎯 आपका बेस बैकएंड यूआरएल (राउट प्रिफिक्स के अनुसार जांच लें)
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
      setGlobalLoading(true); // 🔒 स्क्रीन लॉक

      const config = { headers: { Authorization: `Bearer ${user?.token || localStorage.getItem('token')}` } };
      
      // ✨ फिक्स राउट: /progress/update से बदलकर /update-progress किया
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
      setGlobalLoading(false); // 🔓 स्क्रीन अनलॉक
    }
  };

  // 2️⃣ क्विज़ सबमिशन (यहाँ स्क्रीन लॉक करेंगे ताकि डुप्लीकेट सबमिट न हो)
  const submitQuizOnBackend = async (videoId, answersArray) => {
    try {
      setLoadingMessage("आपके उत्तरों की जांच की जा रही है, कृपया रुकें...");
      setGlobalLoading(true); // 🔒 स्क्रीन लॉक

      const config = {
        headers: { Authorization: `Bearer ${user?.token || localStorage.getItem('token')}` }
      };

      // ✨ फिक्स राउट: /quiz/submit से बदलकर /submit-quiz किया ताकि यह बैकएंड कंट्रोलर को हिट करे
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
          quizResults: response.data.quizResults // 💾 अब अपडेटेड एरे फ्रंटएंड स्टेट में सिंक होगी
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
      setGlobalLoading(false); // 🔓 स्क्रीन अनलॉक
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
      {/* 🎯 अगर globalLoading सच है, तो स्क्रीन लॉक करने वाला कंपोनेंट ऊपर रेंडर होगा */}
      {globalLoading && <Loader message={loadingMessage} />}
      {children}
    </ProgressContext.Provider>
  );
};
