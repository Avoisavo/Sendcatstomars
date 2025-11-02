'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginContent() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      let errorMessage = 'Authentication error occurred.';
      
      switch (errorParam) {
        case 'oauth_failed':
          errorMessage = 'Google login failed. Please try again.';
          break;
        case 'oauth_not_configured':
          errorMessage = 'Google OAuth is not configured. Please check your environment variables.';
          break;
        case 'no_code':
          errorMessage = 'No authorization code received from Google. Please try again.';
          break;
        case 'access_denied':
          errorMessage = 'Access denied. Please grant the necessary permissions.';
          break;
        case 'redirect_uri_mismatch':
          errorMessage = 'Redirect URI mismatch. Check the server console for the exact redirect URI and ensure it matches in Google Cloud Console.';
          break;
        case 'gmail_only':
          errorMessage = 'Only Gmail accounts are allowed. Please sign in with a Gmail account.';
          break;
        default:
          // Decode the error message if it's a custom one
          errorMessage = decodeURIComponent(errorParam).replace(/_/g, ' ') || 'Authentication error occurred.';
      }
      
      setError(errorMessage);
    }
  }, [searchParams]);

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    window.location.href = '/api/auth/google';
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to PsyCatrist Time
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in with your Gmail account to continue
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                  {error.includes('not configured') && (
                    <p className="text-xs text-red-500 dark:text-red-500 mt-1">
                      Make sure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in your .env.local file
                    </p>
                  )}
                  {error.includes('Redirect URI mismatch') && (
                    <p className="text-xs text-red-500 dark:text-red-500 mt-1">
                      Check your server console for the exact redirect URI (look for "⚠️ IMPORTANT"). It should be <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">http://localhost:3001/api/auth/google/callback</code> based on your server port. Add this EXACTLY to Authorized redirect URIs in Google Cloud Console.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Google Sign In Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-4 px-6 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
            >
              {isGoogleLoading ? (
                <svg
                  className="animate-spin h-6 w-6 text-gray-600 dark:text-gray-300"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-lg">Sign in with Gmail</span>
                </>
              )}
            </button>
            
            <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Only Gmail accounts are supported
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          © 2025 PsyCatrist Time. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-full max-w-md p-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

