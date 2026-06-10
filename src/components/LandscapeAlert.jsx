import React, { useState, useEffect } from 'react';

const LandscapeAlert = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // 📱 चेक करें कि क्या यूजर मोबाइल/टैबलेट पर है और स्क्रीन पोर्ट्रेट मोड में है
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      const isPortraitMode = window.matchMedia("(orientation: portrait)").matches;
      
      // अगर मोबाइल है और सीधा (Portrait) पकड़ा है, तो पॉपअप दिखाएं
      if (isMobile && isPortraitMode) {
        setShowPopup(true);
      } else {
        setShowPopup(false); // आड़ा (Landscape) करते ही अपने आप बंद हो जाएगा
      }
    };

    // पहली बार लोड होने पर चेक करें
    checkOrientation();

    // स्क्रीन रीसाइज या रोटेट होने पर ट्रैक करें
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // अगर पॉपअप स्टेट फॉल्स है, तो कुछ भी रेंडर न करें
  if (!showPopup) return null;

  return (
    // 🌫️ बैकग्राउंड ब्लर और डार्क ओवरले (ताकि पीछे का पेज हल्का दिखे)
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      
      {/* 🪙 मुख्य पॉपअप विंडो (Card Window) */}
      <div className="bg-slate-800 text-white rounded-2xl p-6 max-w-sm w-full border border-slate-700 shadow-2xl transform transition-all scale-100 flex flex-col items-center text-center">
        
        {/* 🔄 घूमते हुए फोन का एनिमेटेड आइकॉन */}
        <div className="animate-bounce bg-yellow-500/10 p-4 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-400 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
            <rect x="5" y="2" width="14" height="20" rx="2" transform="rotate(90 12 12)" />
            <path d="M12 5h.01M12 19h.01" />
          </svg>
        </div>

        {/* 📝 हेडिंग और मैसेज */}
        <h3 className="text-xl font-bold mb-2 tracking-wide text-yellow-400">
          लैंडस्केप मोड की सलाह! 🔄
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed mb-6">
          बेहतर व्यू, वीडियो देखने और ऑनलाइन टेस्ट को अच्छे से देने के लिए अपने मोबाइल को **Landscape (घुमाकर)** इस्तेमाल करना सबसे बेस्ट रहता है।
        </p>

        {/* 🤝 एक्शन बटन (पॉपअप को मैन्युअली बंद करने के लिए) */}
        <button
          onClick={() => setShowPopup(false)}
          className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-slate-900 font-bold py-2.5 px-5 rounded-xl transition-all duration-200 shadow-lg active:scale-95"
        >
          ठीक है, समझ गया 👍
        </button>

        <span className="text-[10px] text-slate-400 mt-3 animate-pulse">
          (सुनिश्चित करें कि फोन का Auto-Rotate ऑन हो)
        </span>
      </div>
    </div>
  );
};

export default LandscapeAlert;
