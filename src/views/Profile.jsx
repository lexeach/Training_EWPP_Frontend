// frontend/src/views/Profile.jsx
import React, { useState } from 'react';
import axios from 'axios';

export default function Profile({ user, onBack, setUser }) {
  const [isPaid, setIsPaid] = useState(user.isPaid || false);
  const [loading, setLoading] = useState(false);

  // सुनिश्चित करें कि यह लिंक सही है
  const BACKEND_URL = "https://training-ewpp-backend.onrender.com/api";

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      const keyResponse = await axios.get(`${BACKEND_URL}/payment/key`);
      const razorpayKey = keyResponse.data.key;

      const orderResponse = await axios.post(`${BACKEND_URL}/payment/order`, {
        amount: 350,
        userId: user._id
      });

      const { id: order_id, currency, amount } = orderResponse.data;

      const options = {
        key: razorpayKey,
        amount: amount,
        currency: currency,
        name: "EWPP Training Portal",
        description: "चैनल पार्टनर ट्रेनिंग FEES भुगतान",
        order_id: order_id,
        handler: async function (response) {
          try {
            const verifyResponse = await axios.post(`${BACKEND_URL}/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user._id
            });

            if (verifyResponse.data.success) {
              localStorage.setItem('partnerUser', JSON.stringify(verifyResponse.data.user));
              // 🟢 पेमेंट सफल होने पर तुरंत रिलोड
              window.location.reload(); 
            } else {
              alert("Payment verification failed. Please contact support.");
              setLoading(false);
            }
          } catch (err) {
            console.error("Verification Error:", err);
            alert("Verification server error.");
            setLoading(false);
          }
        },
        prefill: {
          name: user.name || "Partner",
          email: user.email || "partner@company.com",
          contact: user.phone || "9999380378" 
        },
        theme: { color: "#0284c7" },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("Payment Initialization Failed:", error);
      alert("Could not load payment gateway.");
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
          <h3 style={{ marginTop: 0, color: '#0f172a' }}>💳 Training Fee Activation</h3>
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
            {loading ? 'Processing payment...' : '🔒 Pay Now ₹350'}
          </button>
        </div>
      )}
    </div>
  );
}
