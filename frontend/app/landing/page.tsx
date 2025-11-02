'use client';

import Spline from '@splinetool/react-spline';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/catroom');
  };

  return (
    <main 
      onClick={handleClick}
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer'
      }}
    >
      {/* Title at the top */}
      <h1 style={{
        position: 'absolute',
        top: '3rem',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '4rem',
        fontWeight: '900',
        color: 'white',
        textAlign: 'center',
        zIndex: 10,
        pointerEvents: 'none',
        textShadow: `
          0 0 20px rgba(167, 139, 250, 0.8),
          0 0 40px rgba(125, 211, 252, 0.6),
          4px 4px 8px rgba(0, 0, 0, 0.5)
        `,
        margin: 0,
        letterSpacing: '2px',
        textTransform: 'uppercase'
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
    </main>
  );
}

