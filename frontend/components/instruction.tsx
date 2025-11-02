'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface InstructionProps {
  onClose?: () => void;
}

export default function Instruction({ onClose }: InstructionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Delay the popup appearance for smooth entrance
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShouldRender(false);
      onClose?.();
    }, 300);
  };

  if (!shouldRender) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md transition-all duration-700 ${
          isVisible 
            ? 'opacity-100 scale-100 translate-y-[-50%]' 
            : 'opacity-0 scale-95 translate-y-[-45%]'
        }`}
      >
        <div 
          className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-pink-200/50 p-4 overflow-hidden"
          style={{ fontFamily: "'Press Start 2P', 'Orbitron', 'VT323', 'Audiowide', monospace, cursive" }}
        >
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-200/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-pink-100/80 hover:bg-pink-200/80 text-pink-600 flex items-center justify-center transition-all duration-200 hover:scale-110 z-10"
            aria-label="Close"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </button>

          {/* Content */}
          <div className="relative z-10">
            {/* Title */}
            <h2 className="text-3xl font-bold text-center text-pink-600 mb-6 mt-4" style={{ letterSpacing: '0.1em', lineHeight: '1.6' }}>
              Hi There!
            </h2>

            {/* Cute Kitty Image */}
            <div className="flex justify-center mb-6">
              <Image 
                src="/cutekitty.png" 
                alt="Cute Kitty" 
                width={200} 
                height={200}
                className="drop-shadow-xl"
              />
            </div>

            {/* Message */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border-2 border-pink-200/60 mb-6">
              <p className="text-base text-gray-700 text-center" style={{ lineHeight: '1.8' }}>
                I am your comfort cat! You can talk to me, and bring me to walk around my room! 
              </p>
            </div>

            {/* Get Started button */}
            <button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-4 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              style={{ fontSize: '0.875rem', letterSpacing: '0.05em' }}
            >
              Let's Get Started! 
            </button>
          </div>
        </div>
      </div>
    </>
  );
}


