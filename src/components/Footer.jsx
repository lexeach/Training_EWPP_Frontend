import React from 'react';

export default function Footer() {
  return (
    <footer style={{ 
      backgroundColor: '#1e293b', 
      color: '#cbd5e1', 
      padding: '30px 20px', 
      textAlign: 'center',
      marginTop: '50px',
      fontSize: '14px',
      borderTop: '4px solid #0284c7'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h4 style={{ color: '#fff', marginBottom: '10px' }}>Contact Info</h4>
        <p style={{ margin: '5px 0' }}><strong>Autasis Edutech Pvt. Ltd.</strong></p>
        <p style={{ margin: '5px 0' }}>Incubated at AIC IIT Delhi</p>
        <p style={{ margin: '5px 0' }}>
          455, 2nd Floor, I-TEC Technopark, Rajiv Gandhi Education City, <br />
          Rai, Sonipat, Haryana – 131029
        </p>
        <p style={{ margin: '15px 0 0 0' }}>
          📧 Email: <a href="mailto:contact@exowa.click" style={{ color: '#38bdf8', textDecoration: 'none' }}>contact@exowa.click</a>
        </p>
        <p style={{ marginTop: '20px', fontSize: '12px', opacity: 0.7 }}>
          © {new Date().getFullYear()} Autasis Edutech. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
