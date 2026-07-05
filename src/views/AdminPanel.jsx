import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminPanel({ onBack }) {
  const [email, setEmail] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  
  const [users, setUsers] = useState([]);
  const [progressData, setProgressData] = useState([]); // 🟢 प्रोग्रेस डेटा के लिए स्टेट
  const [fetchingUsers, setFetchingUsers] = useState(false);

  const BACKEND_URL = "https://training-ewpp-backend.onrender.com";

  // 🔄 पार्टनर्स और प्रोग्रेस दोनों लोड करें
  const loadAdminData = async (keyToUse) => {
    const key = keyToUse || secretKey;
    if (!key) return;

    setFetchingUsers(true);
    try {
      // 1. पार्टनर्स लिस्ट
      const userRes = await axios.post(`${BACKEND_URL}/api/admin/users`, { secretKey: key });
      // 2. प्रोग्रेस डेटा
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

  // ... (handleActivate और formatActivationDate फंक्शन यहाँ रखें) ...

  return (
    <div style={{ padding: '30px', maxWidth: '1100px', margin: '20px auto' }}>
      <button onClick={onBack} style={{ padding: '8px 16px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' }}>← वापस जाएँ</button>

      {/* ... (आपका अप्रूवल पैनल वाला हिस्सा वैसा ही रखें) ... */}

      {/* 📊 प्रोग्रेस रिपोर्ट टेबल */}
      {secretKey === "myAdminMegaSecret123" && (
        <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', marginTop: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '20px' }}>📈 पार्टनर्स की प्रोग्रेस रिपोर्ट</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ padding: '12px' }}>Name</th>
                  <th style={{ padding: '12px' }}>Videos Watched</th>
                  <th style={{ padding: '12px' }}>Total Quiz Marks</th>
                  <th style={{ padding: '12px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {progressData.map((user, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px' }}>{user.name}</td>
                    <td style={{ padding: '12px' }}>{user.videoProgress}</td>
                    <td style={{ padding: '12px' }}>{user.quizScore}</td>
                    <td style={{ padding: '12px' }}><button style={{ padding: '5px 10px' }}>View Details</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ... (आपकी पुरानी पार्टनर्स लिस्ट टेबल नीचे रखें) ... */}
    </div>
  );
}
