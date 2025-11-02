"use client";

import { useState, useEffect } from 'react';
import Header from '@/components/header';

export default function SubscriptionPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<Array<{ left: number; top: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    setIsVisible(true);
    
    // Generate particle positions after mount to avoid hydration mismatch
    const particleData = Array.from({ length: 20 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
    }));
    setParticles(particleData);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      <Header />
      {/* Enhanced animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Floating particles */}
        <div className="absolute top-0 left-0 w-full h-full">
          {particles.map((particle, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-30 animate-float"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
              }}
            />
          ))}
        </div>
        
        {/* Mouse follower gradient */}
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 rounded-full filter blur-3xl opacity-10 pointer-events-none transition-all duration-700 ease-out"
          style={{
            left: `${mousePosition.x - 192}px`,
            top: `${mousePosition.y - 192}px`,
          }}
        />
      </div>

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className={`text-center mb-16 pt-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <h1 
            className={`text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 bg-clip-text text-transparent mb-6 animate-gradient-x`}
            style={{ fontFamily: 'var(--font-press-start), monospace', fontSize: '1.5rem', letterSpacing: '0.05em', lineHeight: '1.2' }}
          >
            Choose Your Wellness Plan
          </h1>
          <p 
            className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed animate-fade-in-up"
            style={{ fontFamily: 'var(--font-press-start), monospace', fontSize: '0.7rem', letterSpacing: '0.03em', lineHeight: '1.6' }}
          >
            Start your journey to better mental health with our AI-powered
            virtual psychiatrist
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* Free Tier */}
          <div className={`bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 lg:p-10 border-2 border-gray-200 hover:shadow-2xl hover:scale-105 hover:rotate-1 transition-all duration-500 transform group animate-slide-in-left ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="text-center mb-8">
              <div className="inline-block bg-indigo-100 rounded-full p-3 mb-4 animate-float-icon group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h2 
                className="text-3xl font-bold text-gray-900 mb-3 group-hover:scale-105 transition-transform duration-300"
                style={{ fontFamily: 'var(--font-press-start), monospace', fontSize: '1.2rem', letterSpacing: '0.05em' }}
              >
                Starter
              </h2>
              <p 
                className="text-gray-600 mb-6 text-lg"
                style={{ fontFamily: 'var(--font-press-start), monospace', fontSize: '0.7rem', letterSpacing: '0.03em' }}
              >
                Begin your mental wellness journey
              </p>
              <div className="flex items-baseline justify-center gap-2 group-hover:scale-110 transition-transform duration-300">
                <span 
                  className="text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient-x"
                  style={{ fontFamily: 'var(--font-press-start), monospace', fontSize: '2.5rem', letterSpacing: '0.05em' }}
                >
                  RM0
                </span>
                <span 
                  className="text-gray-500 text-xl"
                  style={{ fontFamily: 'var(--font-press-start), monospace', fontSize: '0.7rem', letterSpacing: '0.03em' }}
                >
                  / month
                </span>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              <FeatureItem text="Basic mood tracking and journaling" index={0} />
              <FeatureItem text="Daily mental health check-ins" index={1} />
              <FeatureItem text="AI-powered initial assessments" index={2} />
              <FeatureItem text="Access to wellness resources" index={3} />
              <FeatureItem text="Community support forum" index={4} />
              <FeatureItem text="Limited AI therapy sessions (3 per month)" index={5} />
              <FeatureItem text="Basic progress insights" index={6} />
            </div>

            {/* CTA Button */}
            <button 
              className="relative w-full py-4 px-6 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 overflow-hidden group"
              style={{ fontFamily: 'var(--font-press-start), monospace', fontSize: '0.7rem', letterSpacing: '0.05em' }}
            >
              <span className="relative z-10">Start Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-white opacity-0 group-active:opacity-20"></div>
            </button>
          </div>

          {/* Pro Tier */}
          <div className={`bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-3xl shadow-2xl p-8 lg:p-10 border-4 border-indigo-300 relative hover:shadow-3xl hover:scale-105 hover:-rotate-1 transition-all duration-500 transform group animate-slide-in-right ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            {/* Most Popular Badge */}
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10 animate-bounce-slow">
              <span 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse-slow inline-flex items-center gap-1"
                style={{ fontFamily: 'var(--font-press-start), monospace', fontSize: '0.6rem', letterSpacing: '0.05em' }}
              >
                <span className="animate-spin-slow">⭐</span>
                Most Popular
                <span className="animate-spin-slow">⭐</span>
              </span>
            </div>

            <div className="text-center mb-8 text-white">
              <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full p-3 mb-4 animate-float-icon group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h2 
                className="text-3xl font-bold mb-3 group-hover:scale-105 transition-transform duration-300"
                style={{ fontFamily: 'var(--font-press-start), monospace', fontSize: '1.2rem', letterSpacing: '0.05em' }}
              >
                Premium
              </h2>
              <p 
                className="text-white/90 mb-6 text-lg"
                style={{ fontFamily: 'var(--font-press-start), monospace', fontSize: '0.7rem', letterSpacing: '0.03em' }}
              >
                Complete mental health support at your fingertips
              </p>
              <div className="flex items-baseline justify-center gap-2 group-hover:scale-110 transition-transform duration-300">
                <span 
                  className="text-6xl font-bold text-white animate-pulse-slow"
                  style={{ fontFamily: 'var(--font-press-start), monospace', fontSize: '2.5rem', letterSpacing: '0.05em' }}
                >
                  RM10
                </span>
                <span 
                  className="text-white/80 text-xl"
                  style={{ fontFamily: 'var(--font-press-start), monospace', fontSize: '0.7rem', letterSpacing: '0.03em' }}
                >
                  / month
                </span>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              <FeatureItemPremium text="Everything in Starter plan" index={0} />
              <FeatureItemPremium text="Unlimited AI therapy sessions" index={1} />
              <FeatureItemPremium text="Advanced mood analytics & patterns" index={2} />
              <FeatureItemPremium text="Personalized treatment plans" index={3} />
              <FeatureItemPremium text="24/7 crisis support & resources" index={4} />
              <FeatureItemPremium text="Voice & video therapy sessions" index={5} />
              <FeatureItemPremium text="Sleep & wellness tracking" index={6} />
              <FeatureItemPremium text="Meditation & mindfulness exercises" index={7} />
              <FeatureItemPremium text="Family & relationship counseling" index={8} />
              <FeatureItemPremium text="Priority AI psychiatrist access" index={9} />
              <FeatureItemPremium text="Detailed progress reports & insights" index={10} />
              <FeatureItemPremium text="Export & share wellness data" index={11} />
            </div>

            {/* CTA Button */}
            <button
              onClick={() =>
                (window.location.href =
                  "https://buy.stripe.com/test_bJedRbahe0DF3lDbigdby02")
              }
              className="relative w-full py-4 px-6 rounded-xl bg-white text-indigo-600 font-bold hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 text-lg overflow-hidden group"
              style={{ fontFamily: 'var(--font-press-start), monospace', fontSize: '0.7rem', letterSpacing: '0.05em' }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Get Premium 
                <span className="animate-spin-slow group-hover:scale-125 transition-transform">✨</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-white opacity-0 group-active:opacity-30"></div>
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className={`mt-16 text-center transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <p 
            className="text-gray-600 mb-4 text-lg font-medium"
            style={{ fontFamily: 'var(--font-press-start), monospace', fontSize: '0.7rem', letterSpacing: '0.03em' }}
          >
            Trusted by thousands of users worldwide
          </p>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            <div className="flex items-center gap-2 text-gray-700 hover:scale-110 transition-transform duration-300 group">
              <svg
                className="w-5 h-5 text-green-500 group-hover:animate-bounce"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span 
                className="text-sm font-medium"
                style={{ fontFamily: 'var(--font-press-start), monospace', fontSize: '0.6rem', letterSpacing: '0.03em' }}
              >
                HIPAA Compliant
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 hover:scale-110 transition-transform duration-300 group">
              <svg
                className="w-5 h-5 text-green-500 group-hover:animate-bounce"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span 
                className="text-sm font-medium"
                style={{ fontFamily: 'var(--font-press-start), monospace', fontSize: '0.6rem', letterSpacing: '0.03em' }}
              >
                Secure & Private
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 hover:scale-110 transition-transform duration-300 group">
              <svg
                className="w-5 h-5 text-green-500 group-hover:animate-bounce"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span 
                className="text-sm font-medium"
                style={{ fontFamily: 'var(--font-press-start), monospace', fontSize: '0.6rem', letterSpacing: '0.03em' }}
              >
                AI-Powered
              </span>
            </div>
          </div>
        </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
        }
        
        @keyframes floatIcon {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        
        @keyframes bounceSlow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes pulseSlow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        @keyframes spinSlow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes gradientX {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-icon {
          animation: floatIcon 3s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounceSlow 3s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulseSlow 2s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spinSlow 3s linear infinite;
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradientX 3s ease infinite;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out forwards;
        }
        
        .animate-slide-in-left {
          animation: slideInLeft 0.8s ease-out forwards;
        }
        
        .animate-slide-in-right {
          animation: slideInRight 0.8s ease-out forwards;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

// Feature Item Component for Free Tier
function FeatureItem({ text, index }: { text: string; index: number }) {
  return (
    <div 
      className="flex items-start gap-3 hover:translate-x-2 transition-transform duration-300 group"
      style={{
        animationDelay: `${index * 100}ms`,
        animation: 'fadeInLeft 0.6s ease-out forwards',
      }}
    >
      <div className="flex-shrink-0 mt-0.5 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300">
        <svg
          className="w-5 h-5 text-indigo-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <span 
        className="text-gray-700 text-base leading-relaxed group-hover:text-indigo-700 transition-colors duration-300"
        style={{ fontFamily: 'var(--font-press-start), monospace', fontSize: '0.65rem', letterSpacing: '0.02em', lineHeight: '1.8' }}
      >
        {text}
      </span>
    </div>
  );
}

// Feature Item Component for Premium Tier
function FeatureItemPremium({ text, index }: { text: string; index: number }) {
  return (
    <div 
      className="flex items-start gap-3 hover:translate-x-2 transition-transform duration-300 group"
      style={{
        animationDelay: `${index * 100}ms`,
        animation: 'fadeInRight 0.6s ease-out forwards',
      }}
    >
      <div className="flex-shrink-0 mt-0.5 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300">
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <span 
        className="text-white text-base leading-relaxed font-medium group-hover:text-yellow-200 transition-colors duration-300"
        style={{ fontFamily: 'var(--font-press-start), monospace', fontSize: '0.65rem', letterSpacing: '0.02em', lineHeight: '1.8' }}
      >
        {text}
      </span>
    </div>
  );
}
