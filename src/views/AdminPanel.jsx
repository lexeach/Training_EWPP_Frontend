// frontend/src/views/AdminPanel.jsx
import React, { useState } from 'react';
import axios from 'axios';

export default function AdminPanel({ onBack }) {
  const [email, setEmail] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const BACKEND_URL = "https://training-ewpp-backend.onrender.com/api";

  const handleActivate = async (e) => {
    e.preventDefault();
    if (!email || !secretKey) {
      setIsError(true);
      setMessage("⚠️ कृपया ईमेल और एडमिन सीक्रेट की दोनों भरें।");
      return;
    }

    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      // बैकएंड एंडपॉइंट को कॉल करना
      const response = await axios.post(`${BACKEND_URL}/auth/admin/approve`, {
        email: email,
        secretKey: secretKey // सिक्योरिटी के लिए भेज रहे हैं
      });

      if (response.data.success) {
        setIsError(false);
        setMessage(response.data.message);
        setEmail(''); // सफलता के बाद ईमेल इनपुट खाली करें
      }
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.message || "❌ यूज़र एक्टिवेशन फेल हो गया।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '550px', margin: '40px auto', color: '#1e293b' }}>
      <button 
        onClick={onBack}
        style={{ padding: '8px 16px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' }}
      >
        ← वापस जाएँ
      </button>

      <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
        <h2 style={{ marginTop: 0, borderBottom: '2px solid #0f172a', paddingBottom: '10px', color: '#0f172a' }}>
          🛡️ EWPP एडमिन मैनुअल अप्रूवल पैनल
        </h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px' }}>
          यहाँ आप किसी भी पार्टनर की ईमेल आईडी सर्च करके उसे बिना पेमेंट किए सीधे 🟢 <b>एक्टिव (ट्रेनिंग अनलॉक)</b> स्टेटस दे सकते हैं।
        </p>

        <form onSubmit={handleActivate}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px' }}>पार्टनर की ईमेल आईडी (User Email):</label>
            <input 
              type="email" 
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '15px' }}
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px' }}>एडमिन सीक्रेट की (Admin Secret Key):</label>
            <input 
              type="password" 
              placeholder="अपनी गुप्त चाबी डालें"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '15px' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              background: '#0f172a',
              color: '#fff',
              border: 'none',
              padding: '12px',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'प्रोसेसिंग चालू है...' : '⚡ यूज़र को मैनुअली एक्टिवेट करें'}
          </button>
        </form>

        {message && (
          <div style={{ 
            marginTop: '20px', 
            padding: '12px', 
            borderRadius: '6px', 
            background: isError ? '#fef2f2' : '#f0fdf4', 
            color: isError ? '#991b1b' : '#166534',
            border: `1px solid ${isError ? '#fca5a5' : '#bbf7d0'}`,
            fontWeight: '500',
            fontSize: '14px'
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}