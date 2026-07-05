import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminPanel({ onBack }) {
  const [email, setEmail] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  
  const [users, setUsers] = useState([]);
  const [progressData, setProgressData] = useState([]); 
  const [fetchingUsers, setFetchingUsers] = useState(false);

  const BACKEND_URL = "https://training-ewpp-backend.onrender.com";

  const loadAdminData = async (keyToUse) => {
    const key = keyToUse || secretKey;
    if (!key) return;

    setFetchingUsers(true);
    try {
      const userRes = await axios.post(`${BACKEND_URL}/api/admin/users`, { secretKey: key });
      const progressRes = await axios.get(`${BACKEND_URL}/api/admin/get-user-progress`);
      
      if (userRes.data.success) setUsers(userRes.data.users);
      if (progressRes.data.success) setProgressData(progressRes.data.data);
    } catch (error) {
      console.error("डेटा लोड करने में विफल:", error);
    } finally {
      setFetchingUsers(false);
    }
  };

  useEffect(() => {
    if (secretKey === "myAdminMegaSecret123") {
      loadAdminData(secretKey);
    }
  }, [secretKey]);

  const handleActivate = async (e, customEmail) => {
    if (e) e.preventDefault();
    const targetEmail = customEmail || email;
    if (!targetEmail || !secretKey) {
      setIsError(true);
      setMessage("⚠️ कृपया ईमेल और एडमिन सीक्रेट की भरें।");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/admin/approve`, {
        email: targetEmail.trim(),
        secretKey: secretKey
      });
      if (response.data.success) {
        setIsError(false);
        setMessage(response.data.message);
        setEmail('');
        loadAdminData(secretKey);
      }
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.message || "❌ एक्टिवेशन फेल।");
    } finally {
      setLoading(false);
    }
  };

  const formatActivationDate = (dateString) => {
    if (!dateString) return <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>—</span>;
    const date = new Date(dateString);
    return (
      <div style={{ fontSize: '13px' }}>
        <strong>{date.toLocaleDateString('en-IN')}</strong>
        <div style={{ fontSize: '11px', color: '#64748b' }}>{date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    );
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1100px', margin: '20px auto' }}>
      <button onClick={onBack} style={{ padding: '8px 16px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' }}>← वापस जाएँ</button>

      {/* अप्रूवल कार्ड */}
      <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h2>🛡️ EWPP एडमिन पैनल</h2>
        <input type="password" placeholder="सीक्रेट की..." value={secretKey} onChange={(e) => setSecretKey(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
        <form onSubmit={(e) => handleActivate(e, null)} style={{ display: 'flex', gap: '10px' }}>
          <input type="email" placeholder="ईमेल..." value={email} onChange={(e) => setEmail(e.target.value)} style={{ flex: 1, padding: '10px' }} />
          <button type="submit" disabled={loading}>⚡ एक्टिवेट</button>
        </form>
        {message && <div style={{ marginTop: '10px', color: isError ? 'red' : 'green' }}>{message}</div>}
      </div>

      {/* प्रोग्रेस रिपोर्ट */}
      {secretKey === "myAdminMegaSecret123" && (
        <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', marginBottom: '30px' }}>
          <h3>📈 प्रोग्रेस रिपोर्ट</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#f1f5f9' }}><th style={{ padding: '10px' }}>Name</th><th>Videos</th><th>Marks</th></tr></thead>
            <tbody>
              {progressData.map((u, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{u.name}</td>
                  <td>{u.videoProgress}</td>
                  <td>{u.quizScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* पुराने यूज़र्स लिस्ट */}
      <div style={{ background: '#fff', padding: '25px', borderRadius: '12px' }}>
        <h3>📋 सभी पार्टनर्स</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f1f5f9' }}><th style={{ padding: '10px' }}>Name</th><th>Email</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {users.map((item) => (
              <tr key={item._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{item.name}</td>
                <td>{item.email}</td>
                <td>{item.isPaid ? '✅ Paid' : '❌ Pending'}</td>
                <td>{!item.isPaid && <button onClick={() => handleActivate(null, item.email)}>Activate</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
