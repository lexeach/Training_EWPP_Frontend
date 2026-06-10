import React, { useState, useEffect } from 'react';

const LandscapeAlert = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // 📱 चेक करें कि क्या यूजर मोबाइल/टैबलेट पर है और स्क्रीन पोर्ट्रेट मोड में है
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      const isPortraitMode = window.matchMedia("(orientation: portrait)").matches;
      
      if (isMobile && isPortraitMode) {
        setShowPopup(true);
      } else {
        setShowPopup(false); 
      }
    };

    checkOrientation();

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!showPopup) return null;

  return (
    // 🧱 फिक्स: ज़ी-इंडेक्स को मैक्सिमम किया और फ्लेक्सबॉक्स से परफेक्ट सेंटर अलाइनमेंट दिया
    <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-full z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-hidden">
      
      {/* 🪙 मुख्य पॉपअप विंडो (Modal Box) */}
      <div className="bg-slate-800 text-white rounded-2xl p-6 max-w-[85%] w-full sm:max-w-sm border border-slate-700 shadow-2xl flex flex-col items-center text-center justify-center my-auto">
        
        {/* 🔄 एनिमेटेड आइकॉन */}
        <div className="animate-bounce bg-yellow-500/10 p-3 rounded-full mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-400 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
            <rect x="5" y="2" width="14" height="20" rx="2" transform="rotate(90 12 12)" />
            <path d="M12 5h.01M12 19h.01" />
          </svg>
        </div>

        {/* 📝 टेक्स्ट मैसेजेस */}
        <h3 className="text-lg font-bold mb-2 tracking-wide text-yellow-400">
          लैंडस्केप मोड की सलाह! 🔄
        </h3>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
          बेहतर व्यू, वीडियो देखने और ऑनलाइन टेस्ट को अच्छे से देने के लिए अपने मोबाइल को **Landscape (घुमाकर)** इस्तेमाल करना सबसे बेस्ट रहता है।
        </p>

        {/* 🤝 क्लोज बटन */}
        <button
          onClick={() => setShowPopup(false)}
          className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-slate-900 font-bold py-2 px-4 rounded-xl transition-all duration-200 shadow-lg active:scale-95 text-sm"
        >
          ठीक है, समझ गया 👍
        </button>

        <span className="text-[9px] text-slate-400 mt-2 animate-pulse">
          (सुनिश्चित करें कि फोन का Auto-Rotate ऑन हो)
        </span>
      </div>
    </div>
  );
};

export default LandscapeAlert;
