'use client';

import { useEffect, useState } from 'react';

interface RateProps {
  onClose?: () => void;
}

export default function Rate({ onClose }: RateProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  useEffect(() => {
    // Delay the popup appearance for smooth entrance
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

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
          className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-pink-200/50 p-8 overflow-hidden"
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
            <h2 className="text-2xl font-bold text-center text-pink-600 mb-6" style={{ letterSpacing: '0.1em', lineHeight: '1.6' }}>
              Rate Your Mood 💭
            </h2>

            {/* Message */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border-2 border-pink-200/60 mb-6">
              <p className="text-base text-gray-700 text-center" style={{ lineHeight: '1.8' }}>
                How are you feeling today? Let me know so I can help you better! 🐾
              </p>
            </div>

            {/* Mood Rating Scale */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-center text-gray-700 mb-4" style={{ lineHeight: '1.6' }}>
                Rate your mood from 1 to 10
              </h3>
              <div className="flex justify-between items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`w-10 h-10 rounded-lg font-bold text-sm transition-all duration-200 ${
                      selectedMood === mood
                        ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white scale-110 shadow-lg'
                        : 'bg-white hover:bg-pink-100 text-gray-700 hover:scale-105 border-2 border-pink-200/50'
                    }`}
                    aria-label={`Rate mood ${mood}`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 px-1">
                <span>😢 Sad</span>
                <span>😊 Happy</span>
              </div>
            </div>

            {/* Submit button */}
            <button
              onClick={handleClose}
              disabled={!selectedMood}
              className={`w-full font-semibold py-4 px-6 rounded-full shadow-lg transition-all duration-200 ${
                selectedMood 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white hover:shadow-xl hover:scale-105' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              style={{ fontSize: '0.875rem', letterSpacing: '0.05em' }}
            >
              {selectedMood ? 'Submit Rating 🎉' : 'Please Select a Mood'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

