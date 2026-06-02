// frontend/src/views/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminPanel({ onBack }) {
  const [email, setEmail] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  
  // यूज़र्स लिस्ट टेबल के लिए स्टेट्स
  const [users, setUsers] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  const BACKEND_URL = "https://training-ewpp-backend.onrender.com";

  // 🔄 डेटाबेस से सभी पार्टनर्स की लिस्ट लोड करने का फंक्शन
  // 🔄 डेटाबेस से सभी पार्टनर्स की सूची लोड करने का फंक्शन
  const loadAllUsers = async (keyToUse) => {
    const key = keyToUse || secretKey;
    if (!key) return;

    setFetchingUsers(true);
    try {
      // सही एंडपॉइंट पाथ: /api/admin/users
      //const response = await axios.post(`${BACKEND_URL}/admin/users`, { secretKey: key });
      const response = await axios.post("https://training-ewpp-backend.onrender.com/api/admin/users", { secretKey: key });
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error("यूज़र्स लिस्ट लोड करने में विफल:", error);
    } finally {
      setFetchingUsers(false);
    }
  };

  // 🔄 जैसे ही सीक्रेट की की लंबाई आपके पासवर्ड (myAdminMegaSecret123) के बराबर पहुंचे, लिस्ट लोड हो जाए
  useEffect(() => {
    if (secretKey === "myAdminMegaSecret123") {
      loadAllUsers(secretKey);
    }
  }, [secretKey]);

  // यूज़र को एक्टिवेट करने का मास्टर फंक्शन
  const handleActivate = async (e, customEmail) => {
    if (e) e.preventDefault();
    
    // इनपुट वैल्यू को सीधे यहाँ से उठाएंगे ताकि स्टेट डिले की दिक्कत न हो
    const targetEmail = customEmail || email; 

    if (!targetEmail || !secretKey) {
      setIsError(true);
      setMessage("⚠️ कृपया ईमेल और एडमिन सीक्रेट की दोनों भरें।");
      return;
    }

    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      // सही एंडपॉइंट पाथ: /api/admin/approve
 const response = await axios.post("https://training-ewpp-backend.onrender.com/api/admin/approve", {
  email: targetEmail.trim(),
  secretKey: secretKey
  });

      if (response.data.success) {
        setIsError(false);
        setMessage(response.data.message);
        setEmail(''); // इनपुट बॉक्स साफ़ करें
        loadAllUsers(secretKey); // टेबल डेटा को तुरंत रिफ्रेश करें
      }
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.message || "❌ यूज़र एक्टिवेशन फेल हो गया।");
    } finally {
      setLoading(false);
    }
  };

  // 📅 तारीख़ और समय को भारतीय फॉर्मेट (DD/MM/YYYY, HH:MM AM/PM) में बदलने का हेल्पर
  const formatActivationDate = (dateString) => {
    if (!dateString) return <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>—</span>;
    const date = new Date(dateString);
    return (
      <div style={{ fontSize: '13px' }}>
        <strong>{date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</strong>
        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
          {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1100px', margin: '20px auto', color: '#1e293b', fontFamily: 'sans-serif' }}>
      
      {/* वापस जाने का बटन */}
      <button 
        onClick={onBack}
        style={{ padding: '8px 16px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}
      >
        ← वापस जाएँ
      </button>

      {/* ऊपर का मुख्य कार्ड (कंट्रोलर) */}
      <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
        <h2 style={{ marginTop: 0, borderBottom: '2px solid #0f172a', paddingBottom: '10px', color: '#0f172a' }}>
          🛡️ EWPP एडमिन मैनुअल अप्रूवल पैनल
        </h2>
        
        {/* सीक्रेट की इनपुट बॉक्स */}
        <div style={{ marginBottom: '20px', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', color: '#0f172a' }}>🔑 एडमिन सीक्रेट की दर्ज करें (पैनल डेटा अनलॉक करने के लिए):</label>
          <input 
            type="password" 
            placeholder="अपनी गुप्त चाबी यहाँ डालें..."
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box', fontSize: '15px', fontWeight: 'bold', letterSpacing: '2px' }}
          />
        </div>

        {/* ईमेल सर्च एंड एक्टिवेट इनपुट फॉर्म */}
        <form onSubmit={(e) => handleActivate(e, null)} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px' }}>ईमेल आईडी से तुरंत एक्टिवेट करें:</label>
            <input 
              type="email" 
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '11px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', height: '40px' }}
          >
            {loading ? 'प्रोसेसिंग...' : '⚡ एक्टिवेट करें'}
          </button>
        </form>

        {message && (
          <div style={{ padding: '12px', borderRadius: '6px', background: isError ? '#fef2f2' : '#f0fdf4', color: isError ? '#991b1b' : '#166534', border: `1px solid ${isError ? '#fca5a5' : '#bbf7d0'}`, fontWeight: '500', fontSize: '14px' }}>
            {message}
          </div>
        )}
      </div>

      {/* 📊 यूज़र्स लिस्ट टेबल कार्ड */}
      <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
          <h3 style={{ margin: 0, color: '#0f172a' }}>📋 सभी रजिस्टर्ड पार्टनर्स की सूची ({users.length})</h3>
          {secretKey === "myAdminMegaSecret123" && (
            <button 
              onClick={() => loadAllUsers(null)} 
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'all 0.2s' }}
            >
              🔄 रिफ्रेश लिस्ट
            </button>
          )}
        </div>

        {secretKey !== "myAdminMegaSecret123" ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px', fontStyle: 'italic' }}>
            🔒 टेबल डेटा और पार्टनर्स की सूची देखने के लिए कृपया ऊपर सही 'एडमिन सीक्रेट की' डालें।
          </div>
        ) : fetchingUsers ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#0284c7', fontWeight: 'bold' }}>데이터 लोड हो रहा है, कृपया प्रतीक्षा करें...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '12px', color: '#475569' }}>नाम (Name)</th>
                  <th style={{ padding: '12px', color: '#475569' }}>ईमेल (Email)</th>
                  <th style={{ padding: '12px', color: '#475569' }}>स्टेट्स (Status)</th>
                  <th style={{ padding: '12px', color: '#475569' }}>एक्टिवेशन तारीख़ (Activated At)</th>
                  <th style={{ padding: '12px', color: '#475569', textAlign: 'center' }}>एक्शन (Action)</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid #e2e8f0', hover: {background: '#f8fafc'} }}>
                    <td style={{ padding: '12px', fontWeight: '600', color: '#1e293b' }}>{item.name}</td>
                    <td style={{ padding: '12px', color: '#475569' }}>{item.email}</td>
                    <td style={{ padding: '12px' }}>
                      {item.isPaid ? (
                        <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                          🟢 Paid / Active
                        </span>
                      ) : (
                        <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                          🔴 Pending
                        </span>
                      )}
                    </td>
                    {/* 📅 एक्टिवेशन तारीख़ कॉलम */}
                    <td style={{ padding: '12px', color: '#1e293b' }}>
                      {formatActivationDate(item.activatedAt)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {!item.isPaid ? (
                        <button
                          onClick={() => handleActivate(null, item.email)}
                          disabled={loading}
                          style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(34,197,94,0.2)' }}
                        >
                          ⚡ Activate
                        </button>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '500' }}>No Action</span>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '25px', color: '#64748b' }}>कोई यूज़र नहीं मिला।</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
