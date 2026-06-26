// frontend/src/views/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';

export default function Login({ onLoginSuccess }) {
  // स्क्रीन व्यू को मैनेज करने के लिए: 'login', 'signup', या 'forgot'
  const [view, setView] = useState('login'); 
  
  // फॉर्म स्टेट्स
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  // OTP और लोडिंग स्टेट्स
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = "https://training-ewpp-backend.onrender.com/api";

  // 🟢 1. लॉगिन हैंडलर
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
      alert(err.response?.data?.message || "Login failed! Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // 🟡 2. फॉरगॉट पासवर्ड हैंडलर
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) return alert("Please enter your registered email ID.");
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/auth-utils/forgot-password`, { email });
      if (res.data.success) {
        alert("🎉 Password reset link has been sent to your email.");
        setView('login');
      }
    } catch (err) {
      // 💡 अब यह सर्वर की असली एरर को स्क्रीन पर दिखाएगा!
      alert(err.response?.data?.message || "Problem sending the link.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // फॉर्म को सबमिट होने से रोकें
      sendOTP(); // वही काम करें जो माउस क्लिक पर हो रहा है
    }
  };
  
  // 🔵 3. साइनअप के लिए ईमेल पर OTP भेजना
  const sendOTP = async () => {
    // अब केवल ईमेल चेक करें
    if (!email) return alert("Please enter your email ID.");
    
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/auth-utils/send-signup-otp`, { email });
      if (res.data.success) {
        setIsOtpSent(true);
        alert("🎉 OTP has been sent to your email!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Problem sending OTP.");
    } finally {
      setLoading(false);
    }
  };

  // 🔵 4. भेजा गया OTP वेरीफाई करना
  const verifyOTP = async () => {
    if (!otp) return alert("Please enter the received OTP.");
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/auth-utils/verify-signup-otp`, { email, otp });
      if (res.data.success) {
        setIsVerified(true);
        alert("🟢 Email successfully verified! Now you can complete registration.");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Incorrect OTP, please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🔵 5. फाइनल साइनअप (रजिस्ट्रेशन) सबमिट करना
  const handleSignupSubmit = async (e) => {
    e.preventDefault(); // यह ब्राउज़र को पेज रिफ्रेश करने से रोकता है
    
    // 💡 मुख्य सुधार: अगर OTP अभी तक वेरिफाई नहीं हुआ है, 
    // तो सबमिट को आगे न बढ़ने दें
    if (!isVerified) {
      // अगर ओटीपी भेजा जा चुका है पर वेरीफाई नहीं हुआ
      if (isOtpSent) {
        return alert("Please verify the OTP sent to your email first.");
      }
      // अगर ओटीपी भेजा ही नहीं गया है
      return alert("Please enter your email ID and click 'Send OTP' first.");
    }

    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/auth/register`, { name, email, password, phone });
      alert("🎉 Account created successfully! Now login.");
      
      setIsOtpSent(false);
      setIsVerified(false);
      setOtp('');
      setView('login');
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed.");
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
            <h2 style={{ textAlign: 'center', color: '#38bdf8', marginBottom: '25px' }}>Partner Login</h2>
            <div style={{ marginBottom: '15px' }}>
              <label>Email ID:</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label>Password:</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <div style={{ textAlign: 'right', marginTop: '10px' }}>
              <span onClick={() => setView('forgot')} style={{ color: '#94a3b8', fontSize: '13px', cursor: 'pointer' }}>Forgot Password?</span>
            </div>
            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#94a3b8' }}>
              New Partner? <span onClick={() => setView('signup')} style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: 'bold' }}>Create Account</span>
            </p>
          </form>
        )}

        {/* 🟡 VIEW 2: FORGOT PASSWORD FORM */}
        {view === 'forgot' && (
          <form onSubmit={handleForgotPassword}>
            <h2 style={{ textAlign: 'center', color: '#38bdf8', marginBottom: '15px' }}>Reset Password</h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', marginBottom: '20px' }}>Enter your registered email, we will send a password reset link.</p>
            <div style={{ marginBottom: '20px' }}>
              <label>Email ID:</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#eab308', color: '#0f172a', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <span onClick={() => setView('login')} style={{ color: '#38bdf8', fontSize: '14px', cursor: 'pointer' }}>← Back to Login</span>
            </div>
          </form>
        )}

        {/* 🔵 VIEW 3: SIGNUP WITH OTP FORM */}
        {view === 'signup' && (
          <form onSubmit={handleSignupSubmit}>
            <h2 style={{ textAlign: 'center', color: '#38bdf8', marginBottom: '20px' }}>
              {isVerified ? "Enter Account Details" : "Create New Partner Account"}
            </h2>

            <div style={{ marginBottom: '12px' }}>
              <label>Email ID:</label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  onKeyDown={handleKeyPress} 
                  disabled={isOtpSent || loading} 
                  required 
                  style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} 
                />
                {!isOtpSent && (
                  <button 
                    type="button" 
                    onClick={sendOTP} 
                    disabled={loading} 
                    style={{ 
                      padding: '10px', 
                      background: '#38bdf8', 
                      color: '#0f172a', 
                      border: 'none', 
                      borderRadius: '4px', 
                      fontWeight: 'bold', 
                      cursor: loading ? 'not-allowed' : 'pointer', 
                      opacity: loading ? 0.7 : 1 
                    }}
                  >
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                )}
              </div>
            </div>

            {isOtpSent && !isVerified && (
              <div style={{ background: '#334155', padding: '15px', borderRadius: '6px', marginBottom: '15px' }}>
                <label style={{ fontSize: '13px', color: '#38bdf8' }}>Enter 6-digit OTP sent to email:</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                  <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" style={{ flex: 1, padding: '10px', borderRadius: '4px', border: 'none', textAlign: 'center', fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }} />
                  <button type="button" onClick={verifyOTP} disabled={loading} style={{ padding: '10px 20px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Verify
                  </button>
                </div>
              </div>
            )}

            {isVerified && (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <label>Full Name:</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                </div>


                <div style={{ marginBottom: '12px' }}>
      <label>Mobile Number:</label>
      <input 
        type="text" 
        value={phone} 
        onChange={(e) => setPhone(e.target.value)} 
        placeholder="Enter 10-digit mobile number"
        required 
        style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} 
      />
    </div>
                
                

                <div style={{ marginBottom: '15px' }}>
                  <label>Set Password:</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
                </div>

                <p style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '14px', textAlign: 'center', margin: '5px 0' }}>== Email Verified Successfully! ==</p>
              </>
            )}

            {isVerified && (
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}>
                {loading ? 'Registering...' : 'Register (Complete Signup)'}
              </button>
            )}

            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#94a3b8' }}>
              Already have an account? <span onClick={() => setView('login')} style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: 'bold' }}>Login here</span>
            </p>
          </form>
        )}

      </div>
    </div>
  );
}
