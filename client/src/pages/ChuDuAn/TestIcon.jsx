import React from 'react';
import { HiOutlineHeart, HiOutlineShare } from 'react-icons/hi2';

// Component test đơn giản để debug icons
const TestIcon = () => {
  return (
    <div style={{ padding: '50px', background: '#fff' }}>
      <h2>Test Icons - Nếu thấy icons thì OK</h2>
      
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <button 
          className="ctd-btn-icon"
          style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '10px',
            cursor: 'pointer',
          }}
        >
          <HiOutlineHeart style={{ width: '22px', height: '22px', color: '#374151' }} />
        </button>
        
        <button 
          className="ctd-btn-icon"
          style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '10px',
            cursor: 'pointer',
          }}
        >
          <HiOutlineShare style={{ width: '22px', height: '22px', color: '#374151' }} />
        </button>

        <div style={{ marginLeft: '20px' }}>
          <p>Icon 1: Heart (Lưu tin)</p>
          <p>Icon 2: Share (Chia sẻ)</p>
          <p>Nếu không thấy → Vấn đề với react-icons</p>
          <p>Nếu thấy → Vấn đề với CSS hoặc cache</p>
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', background: '#f3f4f6', borderRadius: '8px' }}>
        <h3>Debug Info:</h3>
        <p><strong>HiOutlineHeart type:</strong> {typeof HiOutlineHeart}</p>
        <p><strong>HiOutlineShare type:</strong> {typeof HiOutlineShare}</p>
      </div>
    </div>
  );
};

export default TestIcon;


