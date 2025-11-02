'use client';

import { useEffect } from 'react';

interface CloudProps {
  onClose: () => void;
  // Position props - you can adjust these in catroom/page.tsx
  top?: string;      // e.g., '10%', '100px', 'auto'
  bottom?: string;   // e.g., '10%', '50px', 'auto'
  left?: string;     // e.g., '10%', '100px', 'auto'
  right?: string;    // e.g., '10%', '50px', 'auto'
}

export default function Cloud({ 
  onClose, 
  top = '57%',      // Default: 20% from top
  bottom = 'auto',  // Default: auto
  left = '65%',     // Default: 50% from left (centered)
  right = 'auto'    // Default: auto
}: CloudProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <>
      {/* Cloud Chat Box */}
      <div
        style={{
          position: 'fixed',
          top,
          bottom,
          left,
          right,
          transform: left === '50%' ? 'translateX(-50%)' : 'none', // Center if left is 50%
          width: '200px',
          minHeight: '40px',
          padding: '2rem 1.1rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #f5f3ff 50%, #eff6ff 100%)',
          borderRadius: '50%',
          boxShadow: `
            0 10px 30px rgba(167, 139, 250, 0.3),
            inset 0 2px 15px rgba(255, 255, 255, 0.8)
          `,
          animation: 'cloudBounce 0.5s ease-out',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}
      >
        {/* Cloud puffs - left side */}
        <div style={{
          position: 'absolute',
          left: '-40px',
          top: '30%',
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%)',
          borderRadius: '50%',
          boxShadow: '0 8px 20px rgba(167, 139, 250, 0.2)'
        }} />
        <div style={{
          position: 'absolute',
          left: '-25px',
          top: '10%',
          width: '65px',
          height: '65px',
          background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)',
          borderRadius: '50%',
          boxShadow: '0 8px 20px rgba(125, 211, 252, 0.2)'
        }} />
        
        {/* Cloud puffs - right side */}
        <div style={{
          position: 'absolute',
          right: '-40px',
          top: '30%',
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
          borderRadius: '50%',
          boxShadow: '0 8px 20px rgba(125, 211, 252, 0.2)'
        }} />
        <div style={{
          position: 'absolute',
          right: '-22px',
          top: '15%',
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%)',
          borderRadius: '50%',
          boxShadow: '0 8px 20px rgba(167, 139, 250, 0.2)'
        }} />
        
        {/* Cloud puffs - top */}
        <div style={{
          position: 'absolute',
          top: '-30px',
          left: '25%',
          width: '70px',
          height: '70px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%)',
          borderRadius: '50%',
          boxShadow: '0 8px 20px rgba(167, 139, 250, 0.2)'
        }} />
        <div style={{
          position: 'absolute',
          top: '-32px',
          right: '25%',
          width: '65px',
          height: '65px',
          background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
          borderRadius: '50%',
          boxShadow: '0 8px 20px rgba(125, 211, 252, 0.2)'
        }} />

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: 'none',
            background: 'linear-gradient(135deg, #c4b5fd 0%, #a5f3fc 100%)',
            color: '#4c1d95',
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(167, 139, 250, 0.3)',
            transition: 'all 0.2s ease',
            zIndex: 10,
            fontWeight: 'bold'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #ddd6fe 0%, #bae6fd 100%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #c4b5fd 0%, #a5f3fc 100%)';
          }}
        >
          ✕
        </button>

        {/* Message content */}
        <div style={{
          position: 'relative',
          zIndex: 5,
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#6366f1',
            margin: 0,
            lineHeight: '1.6',
            textShadow: '1px 1px 2px rgba(167, 139, 250, 0.1)'
          }}>
            Hi! Tell Meow your day! &gt;&lt;
          </p>
        </div>

        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          bottom: '15px',
          left: '30%',
          width: '18px',
          height: '18px',
          background: 'linear-gradient(135deg, rgba(196, 181, 253, 0.4) 0%, rgba(165, 243, 252, 0.4) 100%)',
          borderRadius: '50%',
          zIndex: 5
        }} />
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '25%',
          width: '15px',
          height: '15px',
          background: 'linear-gradient(135deg, rgba(165, 243, 252, 0.4) 0%, rgba(196, 181, 253, 0.4) 100%)',
          borderRadius: '50%',
          zIndex: 5
        }} />
      </div>

      <style jsx>{`
        @keyframes cloudBounce {
          0% {
            transform: scale(0.8) translateY(-20px);
            opacity: 0;
          }
          50% {
            transform: scale(1.05) translateY(5px);
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

