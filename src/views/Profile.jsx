// frontend/src/views/Profile.jsx
import React, { useState } from 'react';
import axios from 'axios';

export default function Profile({ user, onBack, setUser }) {
  const [isPaid, setIsPaid] = useState(user.isPaid || false);
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = "https://training-ewpp-backend.onrender.com/api";

  const handlePayment = async () => {
    setLoading(true);
    console.log("[FRONTEND LOG] Pay Now बटन क्लिक हुआ। Current User Props:", user);
    
    try {
      console.log("[FRONTEND LOG] Keys और Order ID के लिए बैकएंड को कॉल कर रहे हैं...");
      const keyResponse = await axios.get(`${BACKEND_URL}/payment/key`);
      const razorpayKey = keyResponse.data.key;

      const orderResponse = await axios.post(`${BACKEND_URL}/payment/order`, {
        amount: 350,
        userId: user._id
      });

      const { id: order_id, currency, amount } = orderResponse.data;
      console.log("[FRONTEND LOG] Razorpay Order Generated Successfully. Order ID:", order_id);

      const options = {
        key: razorpayKey,
        amount: amount,
        currency: currency,
        name: "EWPP Training Portal",
        description: "चैनल पार्टनर ट्रेनिंग FEES भुगतान",
        order_id: order_id,
        handler: async function (response) {
          console.log("=== 🟢 FRONTEND RAZORPAY SUCCESS HANDLER TRIGGERED ===");
          console.log("Razorpay Response Object:", response);
          
          try {
            console.log("[FRONTEND LOG] बैकएंड के /verify एंडपॉइंट पर डेटा भेज रहे हैं...");
            const verifyResponse = await axios.post(`${BACKEND_URL}/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user._id
            });

            console.log("[FRONTEND LOG] बैकएंड से /verify का रिस्पॉन्स आया:", verifyResponse.data);

            if (verifyResponse.data.success) {
              const freshUserFromDB = verifyResponse.data.user;
              
              console.log("[FRONTEND LOG] रिस्पॉन्स के अंदर का User object:", freshUserFromDB);
              console.log("[FRONTEND LOG] freshUserFromDB.isPaid की वैल्यू:", freshUserFromDB?.isPaid);

              // 💡 लाइव अलर्ट जो सच उगलवाएगा
              alert(
                `📢 [FRONTEND LOG REPORT]\n\n` +
                `1. API Success Status: ${verifyResponse.data.success}\n` +
                `2. Database user found: ${freshUserFromDB ? "YES" : "NO"}\n` +
                `3. Database isPaid Value: ${freshUserFromDB?.isPaid}\n\n` +
                `अगर ऊपर isPaid की वैल्यू true है, तो डेटाबेस अपडेट हो गया है!`
              );

              if (freshUserFromDB && freshUserFromDB.isPaid) {
                localStorage.setItem('partnerUser', JSON.stringify(freshUserFromDB));
                setIsPaid(true);
                
                if (setUser) {
                  setUser(freshUserFromDB); 
                }
              } else {
                alert("🛑 गंभीर चेतावनी: बैकएंड ने success: true दिया, लेकिन लौटे हुए डेटा में isPaid अभी भी false या undefined है!");
                setLoading(false);
              }
            } else {
              alert("🛑 वेरिफिकेशन फेल: " + (verifyResponse.data.message || "अमान्य सिग्नेचर"));
              setLoading(false);
            }
          } catch (err) {
            console.error("[FRONTEND CATCH ERROR] Verification Request Failed:", err);
            alert("🛑 वेरिफिकेशन सर्वर रिस्पॉन्स फेल। एरर लॉग्स देखें।");
            setLoading(false);
          }
        },
        prefill: {
          name: user.name || "Partner",
          email: user.email || "partner@company.com",
          contact: user.phone || "9999380378" 
        },
        theme: {
          color: "#0284c7"
        },
        modal: {
          ondismiss: function() {
            console.log("[FRONTEND LOG] यूजर ने पेमेंट गेटवे पॉपअप बंद कर दिया।");
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("[FRONTEND CATCH ERROR] Payment Initialization Failed:", error);
      alert("🛑 पेमेंट गेटवे लोड नहीं हो सका। कृपया अपनी Render Env Keys चेक करें।");
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', color: '#1e293b' }}>
      <button 
        onClick={onBack}
        style={{ padding: '8px 16px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' }}
      >
        ← Return to the training dashboard
      </button>

      <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <h2 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginTop: 0 }}>👤 Partner Profile Details</h2>
        <p><strong>Name:</strong> {user.name || 'Partner Name'}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Account status:</strong> {isPaid ? '🟢 Active (Training Unlocked)' : '🔴 Pending (Pay fees)'}</p>
      </div>

      {!isPaid && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '30px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, color: '#0f172a' }}>💳 Training Fee Activation (Razorpay Instant Pay)</h3>
          <p style={{ color: '#64748b', maxWidth: '500px', margin: '10px auto 25px auto' }}>
            To unlock all video modules and claim the certificate after training, you need to make a secure one-time payment of <strong>₹350/-</strong>.
          </p>
          
          <button 
            onClick={handlePayment}
            disabled={loading}
            style={{
              background: '#0284c7',
              color: '#fff',
              border: 'none',
              padding: '14px 40px',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '18px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 6px -1px rgba(2, 132, 199, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'The process is starting....' : '🔒 Pay Now ₹350'}
          </button>
        </div>
      )}
    </div>
  );
}
