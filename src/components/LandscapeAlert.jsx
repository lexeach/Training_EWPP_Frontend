import React, { useState, useEffect } from 'react';

const LandscapeAlert = () => {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // 📱 चेक करें कि क्या यूजर मोबाइल/टैबलेट पर है और स्क्रीन पोर्ट्रेट मोड में है
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      const isPortraitMode = window.matchMedia("(orientation: portrait)").matches;
      
      setIsPortrait(isMobile && isPortraitMode);
    };

    // पहली बार रेंडर होने पर चेक करें
    checkOrientation();

    // स्क्रीन घूमने पर या रीसाइज होने पर ट्रैक करें
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // अगर मोबाइल है और पोर्ट्रेट मोड है, तभी यह फुल-स्क्रीन अलर्ट दिखेगा
  if (!isPortrait) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center select-none">
      <div className="animate-bounce mb-6">
        {/* 🔄 घूमते हुए फोन का आइकॉन */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-400 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
          <rect x="5" y="2" width="14" height="20" rx="2" transform="rotate(90 12 12)" />
          <path d="M12 5h.01M12 19h.01" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-2">लैंडस्केप मोड ऑन करें! 🔄</h2>
      <p className="text-slate-300 max-w-sm text-sm sm:text-base">
        बेहतर व्यू, वीडियो देखने और ऑनलाइन टेस्ट को अच्छे से देने के लिए कृपया अपने मोबाइल को **Landscape (घुमाकर)** मोड में रखें।
      </p>
      <div className="mt-4 text-xs text-yellow-500 font-semibold tracking-wider animate-pulse">
        (सुनिश्चित करें कि आपके फोन का Auto-Rotate ऑन हो)
      </div>
    </div>
  );
};

export default LandscapeAlert;
