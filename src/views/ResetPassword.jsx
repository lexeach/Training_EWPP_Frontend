// frontend/src/views/ResetPassword.jsx
import React, { useState } from 'react';
import axios from 'axios';

export default function ResetPassword({ token, onComplete }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = "https://training-ewpp-backend.onrender.com/api";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return alert("दोनों पासवर्ड आपस में मैच नहीं कर रहे हैं!");
    }
    if (password.length < 6) {
      return alert("पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।");
    }

    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/auth-utils/reset-password/${token}`, { password });
      if (res.data.success) {
        alert("🎉 पासवर्ड सफलतापूर्वक बदल गया है! अब आप नए पासवर्ड से लॉगिन कर सकते हैं।");
        onComplete(); // वापस सामान्य लॉगिन स्क्रीन पर भेजने के लिए
      }
    } catch (err) {
      alert(err.response?.data?.message || "पासवर्ड रीसेट लिंक अमान्य है या एक्सपायर हो चुका है।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: '#fff' }}>
      <div style={{ background: '#1e293b', padding: '40px', borderRadius: '8px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
        <form onSubmit={handleSubmit}>
          <h2 style={{ textAlign: 'center', color: '#38bdf8', marginBottom: '25px' }}>नया पासवर्ड सेट करें</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <label>नया पासवर्ड (New Password):</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label>पासवर्ड दोबारा डालें (Confirm Password):</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? 'पासवर्ड अपडेट हो रहा है...' : 'पासवर्ड बदलें'}
          </button>
        </form>
      </div>
    </div>
  );
}