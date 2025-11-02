'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getUserData, isAuthenticated, logout, UserData } from '@/app/utils/userData/auth';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const navLinks = [
    { href: '/chatme', label: 'Chat Box', icon: '' },
    { href: '/catroom', label: 'Cat Room', icon: '' },
    { href: '/bookshelf', label: 'Shelf', icon: '' },
  ];

  // Check authentication status on mount and when pathname changes
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
      
      if (authenticated) {
        const user = getUserData();
        setUserData(user);
        console.log('✅ User logged in:', user?.name, user?.email);
      } else {
        setUserData(null);
        console.log('❌ User not logged in');
      }
    };

    checkAuth();
    
    // Also check when URL changes (e.g., after OAuth redirect)
    const handleRouteChange = () => {
      setTimeout(checkAuth, 100); // Small delay to ensure cookies are set
    };
    
    window.addEventListener('focus', checkAuth);
    return () => window.removeEventListener('focus', checkAuth);
  }, [pathname]);

  const handleLogin = () => {
    // Redirect to Google OAuth
    window.location.href = '/api/auth/google';
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 shadow-sm" style={{ fontFamily: 'var(--font-alegreya-sans), sans-serif' }}>
      <nav className="py-4 relative flex items-center" style={{ minHeight: '80px' }}>
        {/* Logo - positioned absolutely at left edge */}
        <Link 
          href="/" 
          className="flex items-center gap-3 group transition-transform hover:scale-105 absolute left-0 pl-4 top-1/2 -translate-y-1/2"
        >
          <div className="transform group-hover:rotate-12 transition-transform duration-300">
            <Image 
              src="/projectlogo.png" 
              alt="PsyCatrist Time Logo" 
              width={50} 
              height={50}
              className="rounded-full"
            />
          </div>
          <span 
            className="font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent"
            style={{
              fontFamily: 'var(--font-press-start), monospace',
              fontSize: '1.0rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              textShadow: '2px 2px 4px rgba(138, 43, 226, 0.3)',
              filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.5))',
            }}
          >
            PsyCatrist Time
          </span>
        </Link>
        
        <div className="max-w-7xl mx-auto absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2">
          {/* Navigation Links - Centered */}
          <div className="flex items-center gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.href}
                    href={link.href}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-full font-medium
                      transition-all duration-300 ease-out
                      ${isActive 
                        ? 'bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 text-white shadow-lg shadow-purple-500/40' 
                        : 'text-gray-600 hover:bg-gradient-to-r hover:from-violet-50 hover:to-fuchsia-50 hover:text-purple-700'
                      }
                    `}
                  >
                    <span className={`text-lg transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                      {link.icon}
                    </span>
                    <span 
                      className={`font-bold ${
                        isActive 
                          ? 'text-white' 
                          : 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent'
                      }`}
                      style={{
                        textShadow: isActive 
                          ? '2px 2px 0px rgba(0, 0, 0, 0.2), 0 0 15px rgba(255, 255, 255, 0.6)' 
                          : '1px 1px 3px rgba(138, 43, 226, 0.4)',
                        fontFamily: 'var(--font-press-start), monospace',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        fontSize: '0.7rem',
                        filter: isActive ? 'none' : 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.4))',
                      }}
                    >
                      {link.label}
                    </span>
                  </Link>
                );
              })}
          </div>
        </div>

        {/* Login/Logout Buttons - Right Side */}
        <div className="flex items-center gap-2 absolute right-0 pr-4 top-1/2 -translate-y-1/2">
              {/* Subscribe Button */}
              <Link
                href="/subcription"
                className="flex items-center gap-2 px-4 py-2 rounded-full font-medium bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/40 hover:shadow-xl hover:shadow-purple-500/50 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105"
              >
                <span className="text-lg"></span>
                <span 
                  className="font-bold"
                  style={{
                    fontFamily: 'var(--font-press-start), monospace',
                    fontSize: '0.7rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2), 0 0 15px rgba(255, 255, 255, 0.6)',
                  }}
                >
                  Subscribe
                </span>
              </Link>

              {!isLoggedIn ? (
                <button
                  onClick={handleLogin}
                  className="flex items-center gap-2 px-5 py-2 rounded-full font-medium bg-gradient-to-r from-fuchsia-500 via-purple-500 to-violet-500 text-white shadow-lg shadow-purple-500/40 hover:shadow-xl hover:shadow-purple-500/50 hover:from-fuchsia-600 hover:via-purple-600 hover:to-violet-600 transition-all duration-300 hover:scale-105"
                >
                  <span className="text-lg">🔐</span>
                  <span 
                    className="font-bold"
                    style={{
                      fontFamily: 'var(--font-press-start), monospace',
                      fontSize: '0.7rem',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2), 0 0 15px rgba(255, 255, 255, 0.6)',
                    }}
                  >
                    Log In
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  {/* User Info */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 border border-purple-200">
                    {userData?.picture && (
                      <Image
                        src={userData.picture}
                        alt={userData.name || 'User'}
                        width={28}
                        height={28}
                        className="rounded-full border-2 border-white shadow-sm"
                      />
                    )}
                    <span 
                      className="font-bold bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent"
                      style={{
                        fontFamily: 'var(--font-press-start), monospace',
                        fontSize: '0.65rem',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {userData?.name?.split(' ')[0] || 'User'}
                    </span>
                  </div>
                  
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-full font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 border border-gray-300 hover:border-gray-400 transition-all duration-300 hover:scale-105"
                  >
                    <span className="text-lg">👋</span>
                    <span 
                      className="font-bold"
                      style={{
                        fontFamily: 'var(--font-press-start), monospace',
                        fontSize: '0.7rem',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Log Out
                    </span>
                  </button>
                </div>
              )}
        </div>
      </nav>

      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </header>
  );
}

