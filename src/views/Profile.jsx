// frontend/src/views/Profile.jsx ke andar handlePayment ke andar ka options block

handler: async function (response) {
  try {
    console.log("[FRONTEND] Verification request bhej rahe hain...");
    const verifyResponse = await axios.post(`${BACKEND_URL}/payment/verify`, {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      userId: user._id
    });

    if (verifyResponse.data.success) {
      // 💡 DATABASE CONFIRMATION: Backend se aaya hua fresh user data uthayein
      const freshUserFromDB = verifyResponse.data.user;

      if (freshUserFromDB && freshUserFromDB.isPaid) {
        alert("🎉 भुगतान सफल रहा और डेटाबेस में सुरक्षित सेव हो गया है!");
        
        // LocalStorage mein save karein
        localStorage.setItem('partnerUser', JSON.stringify(freshUserFromDB));
        
        // Local state ko true karein
        setIsPaid(true);
        
        // Parent state (App.jsx) ko update karein jisse auto-redirect chal jaye
        if (setUser) {
          setUser(freshUserFromDB); 
        }
      } else {
        // Agar payment success hui par backend ne user.isPaid: true nahi bheja
        alert("🛑 Alert: पेमेंट तो हो गई, par database mein isPaid: true update nahi hua. Backend logs check karein!");
        setLoading(false);
      }
    } else {
      alert("🛑 वेरिफिकेशन फेल: " + (verifyResponse.data.message || "अमान्य सिग्नेचर"));
      setLoading(false);
    }
  } catch (err) {
    console.error("Verification Error:", err);
    alert("🛑 वेरिफिकेशन सर्ver रिस्पॉन्स फेल।");
    setLoading(false);
  }
}