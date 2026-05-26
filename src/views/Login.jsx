// frontend/src/views/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';

export default function Login({ onLoginSuccess }) {
  const [isSignup, setIsSignup] = useState(false); // Login और Signup स्विच करने के लिए स्टेट
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = "https://training-ewpp-backend.onrender.com/api/auth";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSignup) {
        // --- SIGNUP LOGIC ---
        await axios.post(`${BACKEND_URL}/register`, {
          name,
          email,
          password
        });
        
        setSuccess('🎉 रजिस्ट्रेशन सफल रहा! अब आप लॉगिन कर सकते हैं।');
        setIsSignup(false); // रजिस्ट्रेशन के बाद सीधे लॉगिन स्क्रीन पर भेजें
        setPassword(''); // पासवर्ड फील्ड खाली करें
      } else {
        // --- LOGIN LOGIC ---
        const response = await axios.post(`${BACKEND_URL}/login`, {
          email,
          password
        });
        
        // लॉगिन सक्सेस होने पर पैरेंट कॉम्पोनेंट को डेटा भेजना
        onLoginSuccess(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'कुछ गड़बड़ हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  // स्क्रीन स्विच करते समय फॉर्म डेटा और एरर साफ़ करने के लिए
  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError('');
    setSuccess('');
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#0f172a'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: '#fff',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
      }}>
        {/* डायनामिक हेडिंग */}
        <h2 style={{ textAlign: 'center', margin: '0 0 10px 0', color: '#1e293b' }}>
          {isSignup ? 'EWPP Partner Signup' : 'EWPP Partner Login'}
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
          {isSignup ? 'चैनल पार्टनर बनने के लिए अपनी डिटेल्स भरें।' : 'ट्रेनिंग पोर्टल में आपका स्वागत है। आगे बढ़ने के लिए लॉगिन करें।'}
        </p>

        {/* एरर मैसेज */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' }}>
            🛑 {error}
          </div>
        )}

        {/* सक्सेस मैसेज */}
        {success && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* अगर Signup मोड ऑन है, तो ही 'नाम' वाला इनपुट दिखेगा */}
          {isSignup && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#334155' }}>पूरा नाम</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="आपका नाम"
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              />
            </div>
          )}

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#334155' }}>ईमेल एड्रेस</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="partner@company.com"
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#334155' }}>पासवर्ड</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: isSignup ? '#10b981' : '#0284c7', // Signup के लिए ग्रीन, Login के लिए ब्लू
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'कृपया प्रतीक्षा करें...' : (isSignup ? 'Register Account' : 'Login')}
          </button>
        </form>

        {/* नीचे स्विच करने का लिंक */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
          {isSignup ? (
            <span>
              पहले से अकाउंट है?{' '}
              <button onClick={toggleMode} style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 'bold', padding: 0, textDecoration: 'underline' }}>
                यहाँ लॉगिन करें
              </button>
            </span>
          ) : (
            <span>
              नए पार्टनर हैं?{' '}
              <button onClick={toggleMode} style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: 'bold', padding: 0, textDecoration: 'underline' }}>
                अकाउंट बनाएं (Signup)
              </button>
            </span>
          )}
        </div>

      </div>
    </div>
  );
}