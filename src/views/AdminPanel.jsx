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
  const [selectedUserProgress, setSelectedUserProgress] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(false);

  const BACKEND_URL = "https://training-ewpp-backend.onrender.com";

  // 1. Sabhi Users aur Live Data load karna
  const loadAllUsers = async (keyToUse) => {
    const key = keyToUse || secretKey;
    if (!key) return;

    setFetchingUsers(true);
    try {
      // Users list fetch karein
      const response = await axios.post(`${BACKEND_URL}/api/admin/users`, { secretKey: key });
      
      // 🟢 मास्टर फिक्स: /api/modules पर 401 एरर आ रहा था। 
      // इसलिए हम एडमिन के ही खुद के /api/admin/get-user-progress रूट का उपयोग करेंगे जो बिना टोकन के लाइव चल रहा है।
      const progressRes = await axios.get(`${BACKEND_URL}/api/admin/get-user-progress`);
      
      if (response.data.success) setUsers(response.data.users);
      
      if (progressRes.data.success && Array.isArray(progressRes.data.data)) {
        // प्रोग्रेस डेटा को सुरक्षित रखें
        setProgressData(progressRes.data.data);
      }
    } catch (error) {
      console.error("डेटा लोड करने में विफल:", error);
    } finally {
      setFetchingUsers(false);
    }
  };

  useEffect(() => {
    if (secretKey === "myAdminMegaSecret123") {
      loadAllUsers(secretKey);
    }
  }, [secretKey]);

  // 2. View Details click karne par Particular User ka Live Progress prapt (fetch) karna
  const handleViewDetails = async (userItem) => {
    setSelectedUser(userItem);
    setLoadingProgress(true);
    setSelectedUserProgress(null);

    try {
      // बैकएंड के नए रूट से डेटा मंगाएं जिसमें फुल ऐरे मौजूद हैं
      const res = await axios.get(`${BACKEND_URL}/api/admin/get-user-progress`);
      
      if (res.data.success && Array.isArray(res.data.data)) {
        // प्रोग्रेस डेटा में से इस स्पेसिफिक यूजर को ढूंढें
        const userLiveProgress = res.data.data.find(p => 
          (p.email && p.email === userItem.email) || 
          (p.userId && p.userId === userItem._id) || 
          (p.user && p.user === userItem._id)
        );
        
        if (userLiveProgress) {
          console.log("✅ यूजर का प्रोग्रेस ऐरे फॉर्मेट में मिल गया:", userLiveProgress);
          setSelectedUserProgress({
            ...userItem,
            // सीधे असली ऐरे पास हो रहे हैं, फालतू की 'quizScore: 0' फील्ड पूरी तरह बाईपास होगी
            completedVideos: userLiveProgress.completedVideos || [],
            quizResults: userLiveProgress.quizResults || []
          });
        } else {
          console.log("⚠️ इस ईमेल/आईडी से कोई लाइव प्रोग्रेस मैच नहीं हुई। Fallback लागू।");
          setSelectedUserProgress({
            ...userItem,
            completedVideos: userItem.completedVideos || [],
            quizResults: userItem.quizResults || []
          });
        }
      }
    } catch (err) {
      console.error("User progress fetch karne me error:", err);
      setSelectedUserProgress({
        ...userItem,
        completedVideos: userItem.completedVideos || [],
        quizResults: userItem.quizResults || []
      });
    } finally {
      setLoadingProgress(false);
    }
  };

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
        // 🟢 TestListPage Screen (जब किसी यूजर पर क्लिक किया हो)
        <div style={{ padding: '30px', maxWidth: '1100px', margin: '20px auto' }}>
          <button 
            onClick={() => { setSelectedUser(null); setSelectedUserProgress(null); }} 
            style={{ padding: '8px 16px', background: '#475569', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}
          >
            ← वापस एडमिन लिस्ट पर
          </button>
          
          {loadingProgress ? (
            <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#475569' }}>
              ⏳ यूज़र का प्रोग्रेस डेटा लोड हो रहा है, कृपया प्रतीक्षा करें...
            </div>
          ) : (
            /* 🟢 हम सीधे selectedUserProgress को ही पास कर रहे हैं, जो TestListPage को लाइव री-रेंडर करने की शक्ति देगा */
            <TestListPage 
              user={selectedUserProgress} 
              onBack={() => { setSelectedUser(null); setSelectedUserProgress(null); }} 
              progressData={progressData} 
            />
          )}
        </div>
      ) : (
        // 🟢 Main Admin Dashboard Screen
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
            {fetchingUsers ? <p>यूज़र्स लोड हो रहे हैं...</p> : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>Name</th>
                    <th style={{ padding: '12px' }}>Email</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((item) => (
                    <tr key={item._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px' }}>{item.name}</td>
                      <td style={{ padding: '12px' }}>{item.email}</td>
                      <td style={{ padding: '12px' }}>{item.isPaid ? '🟢 Paid' : '🔴 Pending'}</td>
                      <td style={{ padding: '12px' }}>
                        <button onClick={() => handleViewDetails(item)} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>View Details</button>
                        {!item.isPaid && <button onClick={() => handleActivate(null, item.email)} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px' }}>⚡ Activate</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </>
  );
}
