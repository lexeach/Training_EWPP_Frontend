import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TestListPage from './TestListPage'; 

export default function AdminPanel({ onBack }) {
  const [email, setEmail] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  
  const [users, setUsers] = useState([]);
  const [progressData, setProgressData] = useState([]); 
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); 

  const BACKEND_URL = "https://training-ewpp-backend.onrender.com";

  const loadAllUsers = async (keyToUse) => {
    const key = keyToUse || secretKey;
    if (!key) return;

    setFetchingUsers(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/admin`, { secretKey: key });
      const progressRes = await axios.get(`${BACKEND_URL}/api/admin/get-user-progress`);
      
      if (response.data.success) setUsers(response.data.users);
      // यहाँ सुनिश्चित करें कि प्रोग्रेस डेटा सही फॉर्मेट में आ रहा है
      if (progressRes.data.success) setProgressData(progressRes.data.data); 
    } catch (error) {
      console.error("डेटा लोड करने में विफल:", error);
    }
  };

  useEffect(() => {
    if (secretKey === "myAdminMegaSecret123") {
      loadAllUsers(secretKey);
    }
  }, [secretKey]);

  const handleActivate = async (e, customEmail) => {
    if (e) e.preventDefault();
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
      const response = await axios.post(`${BACKEND_URL}/api/admin/approve`, {
        email: targetEmail.trim(),
        secretKey: secretKey
      });
      if (response.data.success) {
        setIsError(false);
        setMessage(response.data.message);
        setEmail('');
        loadAllUsers(secretKey);
      }
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.message || "❌ यूज़र एक्टिवेशन फेल हो गया।");
    } finally {
      setLoading(false);
    }
  };

  // ✅ मुख्य रेंडरिंग लॉजिक
  return (
    <>
      {selectedUser ? (
        // ✅ अगर कोई यूजर सिलेक्टेड है, तो यह हिस्सा रेंडर होगा
        <div style={{ padding: '30px', maxWidth: '1100px', margin: '20px auto' }}>
          <button 
            onClick={() => setSelectedUser(null)} 
            style={{ padding: '8px 16px', background: '#475569', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' }}
          >
            ← वापस एडमिन लिस्ट पर
          </button>
          <TestListPage 
            user={selectedUser} 
            onBack={() => setSelectedUser(null)} 
            progressData={progressData} 
          />
        </div>
      ) : (
        // ✅ वरना, एडमिन डैशबोर्ड रेंडर होगा
        <div style={{ padding: '30px', maxWidth: '1100px', margin: '20px auto', color: '#1e293b', fontFamily: 'sans-serif' }}>
          <button onClick={onBack} style={{ padding: '8px 16px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}>← वापस जाएँ</button>

          <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
            <h2 style={{ marginTop: 0, borderBottom: '2px solid #0f172a', paddingBottom: '10px' }}>🛡️ EWPP एडमिन पैनल</h2>
            <input type="password" placeholder="सीक्रेट की..." value={secretKey} onChange={(e) => setSecretKey(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #94a3b8' }} />
            <form onSubmit={(e) => handleActivate(e, null)} style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <input type="email" placeholder="ईमेल..." value={email} onChange={(e) => setEmail(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px' }} />
              <button type="submit" disabled={loading} style={{ background: '#0f172a', color: '#fff', padding: '0 20px', borderRadius: '6px', cursor: 'pointer' }}>⚡ एक्टिवेट</button>
            </form>
            {message && <div style={{ marginTop: '10px', color: isError ? 'red' : 'green' }}>{message}</div>}
          </div>

          <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h3>📋 सभी रजिस्टर्ड पार्टनर्स ({users.length})</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f1f5f9' }}><th style={{ padding: '12px' }}>Name</th><th>Email</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px' }}>{item.name}</td>
                    <td style={{ padding: '12px' }}>{item.email}</td>
                    <td style={{ padding: '12px' }}>{item.isPaid ? '🟢 Paid' : '🔴 Pending'}</td>
                    <td style={{ padding: '12px' }}>
                      <button onClick={() => setSelectedUser(item)} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>View Details</button>
                      {!item.isPaid && <button onClick={() => handleActivate(null, item.email)} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px' }}>⚡ Activate</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
