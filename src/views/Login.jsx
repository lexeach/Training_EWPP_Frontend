// frontend/src/views/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';

export default function Login({ onLoginSuccess }) {
  // स्क्रीन व्यू को मैनेज करने के लिए: 'login', 'signup', या 'forgot'
  const [view, setView] = useState('login'); 
  
  // फॉर्म स्टेट्स
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  // OTP और लोडिंग स्टेट्स
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = "https://training-ewpp-backend.onrender.com/api";

  // 🟢 1. लॉगिन हैंडलर
  // 🟢 1. लॉगिन हैंडलर (Update this part in Login.jsx)
const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await axios.post(`${BACKEND_URL}/auth/login`, { email, password });
    
    // 🚀 [FIX] टोकन को स्टोर करें (यह लाइन आपके कोड में मिसिंग थी!)
    if (res.data && res.data.token) {
      localStorage.setItem('token', res.data.token);
    }
    
    onLoginSuccess(res.data.user || res.data);
  } catch (err) {
    alert(err.response?.data?.message || "लॉगिन फेल! कृपया डिटेल्स जांचें।");
  } finally {
    setLoading(false);
  }
};

  // 🟡 2. फॉरगॉट पासवर्ड हैंडलर
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) return alert("कृपया अपनी रजिस्टर्ड ईमेल आईडी डालें।");
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/auth-utils/forgot-password`, { email });
      if (res.data.success) {
        alert("🎉 पासवर्ड रीसेट लिंक आपकी ईमेल पर भेज दिया गया है।");
        setView('login');
      }
    } catch (err) {
      // 💡 अब यह सर्वर की असली एरर को स्क्रीन पर दिखाएगा!
      alert(err.response?.data?.message || "लिंक भेजने में समस्या आई।");
    } finally {
      setLoading(false);
    }
  };

  // 🔵 3. साइनअप के लिए ईमेल पर OTP भेजना
  const sendOTP = async () => {
    if (!name || !email || !password) return alert("कृपया पहले नाम, ईमेल और पासवर्ड भरें।");
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/auth-utils/send-signup-otp`, { email });
      if (res.data.success) {
        setIsOtpSent(true);
        alert("🎉 OTP आपकी ईमेल पर भेज दिया गया है!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "OTP भेजने में समस्या आई।");
    } finally {
      setLoading(false);
    }
  };

  // 🔵 4. भेजा गया OTP वेरीफाई करना
  const verifyOTP = async () => {
    if (!otp) return alert("कृपया प्राप्त हुआ OTP डालें।");
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/auth-utils/verify-signup-otp`, { email, otp });
      if (res.data.success) {
        setIsVerified(true);
        alert("🟢 ईमेल सफलतापूर्वक वेरीफाई हो गई है! अब आप फाइनल रजिस्टर कर सकते हैं।");
      }
    } catch (err) {
      alert(err.response?.data?.message || "गलत OTP, कृपया दोबारा प्रयास करें।");
    } finally {
      setLoading(false);
    }
  };

  // 🔵 5. फाइनल साइनअप (रजिस्ट्रेशन) सबमिट करना
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!isVerified) return alert("अकाउंट बनाने से पहले कृपया ईमेल OTP वेरीफाई करें।");
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/auth/register`, { name, email, password });
      alert("🎉 अकाउंट सफलतापूर्वक बन गया है! अब लॉगिन करें।");
      
      // स्टेट्स रीसेट करके लॉगिन स्क्रीन पर भेजें
      setIsOtpSent(false);
      setIsVerified(false);
      setOtp('');
      setView('login');
    } catch (err) {
      alert(err.response?.data?.message || "साइनअप फेल हो गया।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: '#fff' }}>
      <div style={{ background: '#1e293b', padding: '40px', borderRadius: '8px', width: '100%', maxWidth: '420px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
        
        {/* 🟢 VIEW 1: LOGIN FORM */}
        {view === 'login' && (
          <form onSubmit={handleLogin}>
            <h2 style={{ textAlign: 'center', color: '#38bdf8', marginBottom: '25px' }}>पार्टनर लॉगिन</h2>
            <div style={{ marginBottom: '15px' }}>
              <label>ईमेल आईडी:</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label>पासवर्ड:</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? 'लॉगिन हो रहा है...' : 'लॉगिन करें'}
            </button>
            <div style={{ textAlign: 'right', marginTop: '10px' }}>
              <span onClick={() => setView('forgot')} style={{ color: '#94a3b8', fontSize: '13px', cursor: 'pointer' }}>पासवर्ड भूल गए (Forgot Password)?</span>
            </div>
            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#94a3b8' }}>
              नए पार्टनर हैं? <span onClick={() => setView('signup')} style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: 'bold' }}>यहाँ अकाउंट बनाएं</span>
            </p>
          </form>
        )}

        {/* 🟡 VIEW 2: FORGOT PASSWORD FORM */}
        {view === 'forgot' && (
          <form onSubmit={handleForgotPassword}>
            <h2 style={{ textAlign: 'center', color: '#38bdf8', marginBottom: '15px' }}>पासवर्ड रीसेट</h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', marginBottom: '20px' }}>अपनी रजिस्टर्ड ईमेल डालें, हम उस पर पासवर्ड बदलने का लिंक भेजेंगे।</p>
            <div style={{ marginBottom: '20px' }}>
              <label>ईमेल आईडी:</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#eab308', color: '#0f172a', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? 'लिंक भेजा जा रहा है...' : 'रीसेट लिंक भेजें'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <span onClick={() => setView('login')} style={{ color: '#38bdf8', fontSize: '14px', cursor: 'pointer' }}>← वापस लॉगिन पर आएं</span>
            </div>
          </form>
        )}

        {/* 🔵 VIEW 3: SIGNUP WITH OTP FORM */}
        {view === 'signup' && (
          <form onSubmit={handleSignupSubmit}>
            <h2 style={{ textAlign: 'center', color: '#38bdf8', marginBottom: '20px' }}>नया पार्टनर अकाउंट बनाएं</h2>
            
            <div style={{ marginBottom: '12px' }}>
              <label>पूरा नाम:</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={isOtpSent} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label>ईमेल आईडी:</label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isOtpSent} required style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                {!isOtpSent && (
                  <button type="button" onClick={sendOTP} disabled={loading} style={{ padding: '10px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Send OTP
                  </button>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>पासवर्ड सेट करें:</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isOtpSent} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
            </div>

            {/* OTP इनपुट सेक्शन (ईमेल पर OTP सेंड होने के बाद एक्टिव होगा) */}
            {isOtpSent && !isVerified && (
              <div style={{ background: '#334155', padding: '15px', borderRadius: '6px', marginBottom: '15px' }}>
                <label style={{ fontSize: '13px', color: '#38bdf8' }}>ईमेल पर आया 6-डिजिट OTP डालें:</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                  <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="OTP दर्ज करें" style={{ flex: 1, padding: '10px', borderRadius: '4px', border: 'none', textAlign: 'center', fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }} />
                  <button type="button" onClick={verifyOTP} disabled={loading} style={{ padding: '10px 20px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Verify
                  </button>
                </div>
              </div>
            )}

            {isVerified && (
              <p style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '14px', textAlign: 'center', margin: '5px 0' }}>== ईमेल सफलतापूर्वक सत्यापित! ==</p>
            )}

            <button type="submit" disabled={!isVerified || loading} style={{ width: '100%', padding: '12px', background: isVerified ? '#22c55e' : '#64748b', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '16px', cursor: isVerified ? 'pointer' : 'not-allowed', marginTop: '10px' }}>
              {loading ? 'रजिस्टर हो रहा है...' : 'रजिस्टर करें (Complete Signup)'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#94a3b8' }}>
              पहले से अकाउंट है? <span onClick={() => setView('login')} style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: 'bold' }}>यहाँ लॉगिन करें</span>
            </p>
          </form>
        )}

      </div>
    </div>
  );
}
