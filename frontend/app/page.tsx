'use client';

import Spline from '@splinetool/react-spline';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [isFading, setIsFading] = useState(false);

  const handleClick = () => {
    setIsFading(true);
    setTimeout(() => {
      router.push('/catroom');
    }, 1000); // Wait for fade animation to complete
  };

  return (
    <main 
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Title at the top */}
      <h1 style={{
        position: 'absolute',
        top: '4.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '4rem',
        fontWeight: '900',
        color: '#00FFFF',
        textAlign: 'center',
        zIndex: 10,
        pointerEvents: 'none',
        textShadow: `
          3px 3px 0px #FF00FF,
          6px 6px 0px #FF1493,
          9px 9px 0px #8B008B,
          12px 12px 0px #4B0082,
          15px 15px 20px rgba(0, 0, 0, 0.8),
          0 0 30px rgba(0, 255, 255, 0.8),
          0 0 60px rgba(255, 0, 255, 0.6)
        `,
        margin: 0,
        letterSpacing: '12px',
        textTransform: 'uppercase',
        fontFamily: 'var(--font-press-start), "Courier New", monospace',
        WebkitTextStroke: '2px #000033',
        paintOrder: 'stroke fill',
        whiteSpace: 'nowrap',
        width: 'max-content',
        maxWidth: '95vw'
      }}>
        PsyCatrist Time
      </h1>

      <div style={{
        width: '120%',
        height: '120%',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none'
      }}>
        <Spline
          scene="https://prod.spline.design/11IDjxMUwN7d3QYS/scene.splinecode" 
        />
      </div>

      {/* Start Button in the middle */}
      <button 
        onClick={handleClick}
        style={{
          position: 'absolute',
          top: '90%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '2.5rem',
          fontWeight: '900',
          color: '#00FFFF',
          backgroundColor: 'transparent',
          border: '4px solid #00FFFF',
          padding: '1.5rem 3rem',
          cursor: 'pointer',
          zIndex: 10,
          textShadow: `
            2px 2px 0px #FF00FF,
            4px 4px 0px #FF1493,
            6px 6px 0px #8B008B,
            8px 8px 0px #4B0082,
            10px 10px 15px rgba(0, 0, 0, 0.8),
            0 0 20px rgba(0, 255, 255, 0.8),
            0 0 40px rgba(255, 0, 255, 0.6)
          `,
          letterSpacing: '8px',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-press-start), "Courier New", monospace',
          WebkitTextStroke: '1px #000033',
          paintOrder: 'stroke fill',
          whiteSpace: 'nowrap',
          boxShadow: `
            0 0 20px rgba(0, 255, 255, 0.6),
            0 0 40px rgba(255, 0, 255, 0.4),
            inset 0 0 20px rgba(0, 255, 255, 0.2)
          `,
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)';
          e.currentTarget.style.boxShadow = `
            0 0 30px rgba(0, 255, 255, 0.8),
            0 0 60px rgba(255, 0, 255, 0.6),
            inset 0 0 30px rgba(0, 255, 255, 0.3)
          `;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
          e.currentTarget.style.boxShadow = `
            0 0 20px rgba(0, 255, 255, 0.6),
            0 0 40px rgba(255, 0, 255, 0.4),
            inset 0 0 20px rgba(0, 255, 255, 0.2)
          `;
        }}
      >
        START
      </button>

      {/* Black fade overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'black',
        opacity: isFading ? 1 : 0,
        transition: 'opacity 1s ease-in-out',
        pointerEvents: isFading ? 'all' : 'none',
        zIndex: 9999
      }} />
    </main>
  );
}
