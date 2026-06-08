// frontend/src/context/ProgressContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios'; // सही इम्पोर्ट सेट है

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
        
        // 🔒 सुरक्षा सुधार के साथ मॉड्यूल फेच करना (टोकन हेडर जोड़ा)
        const config = {
          headers: { Authorization: `Bearer ${user?.token || localStorage.getItem('token')}` }
        };
        const response = await axios.get(`${BACKEND_URL}/modules`, config);
        
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
    if (user?.token) {
      fetchModules();
    }
  }, [user?.token]); // टोकन मिलने पर ही मॉड्यूल्स फेच करें

  // 1️⃣ पुराना डायरेक्ट प्रोग्रेस अपडेट (बिना क्विज़ वाले वीडियो के लिए बैकअप)
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

  // 2️⃣ 🎯 नया फंक्शन: ऑनलाइन असेसमेंट (Quiz) सबमिट करने के लिए
  const submitQuizOnBackend = async (videoId, answersArray) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user?.token || localStorage.getItem('token')}` }
      };

      // 🔄 आपके पुराने रूट्स आर्किटेक्चर के अनुसार सही एंडपॉइंट पर हिट मारना
      const response = await axios.post(`${BACKEND_URL}/quiz/submit`, { 
        videoId, 
        answers: answersArray 
      }, config);

      if (response.data) {
        // कांटेक्स्ट की स्टेट्स को तुरंत अपडेट करें
        setCompletedVideos(response.data.completedVideos);
        setCurrentUnlockedVideo(response.data.currentUnlockedVideo);
        
        // 📊 सबसे ज़रूरी: लाइव यूजर स्टेट और लोकल स्टोरेज को अपडेट करना ताकि परफॉर्मेंस डैशबोर्ड तुरंत बदल सके
        const updatedUser = {
          ...user,
          completedVideos: response.data.completedVideos,
          currentUnlockedVideo: response.data.currentUnlockedVideo,
          quizResults: response.data.quizResults // बैकएंड से आया नया रिजल्ट ऐरे
        };
        setUser(updatedUser);
        localStorage.setItem('partnerUser', JSON.stringify(updatedUser));

        return response.data; // रिजल्ट स्क्रीन पर दिखाने के लिए डेटा वापस भेजा
      }
    } catch (error) {
      console.error("Quiz Submission Error:", error);
      const errorMsg = error.response?.data?.message || "क्विज़ सबमिट करने में कोई समस्या आई।";
      alert(errorMsg);
      return null;
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
      submitQuizOnBackend, // 🎯 वैल्युएबल प्रोवाइडर में ऐड किया
      loading
    }}>
      {children}
    </ProgressContext.Provider>
  );
};
