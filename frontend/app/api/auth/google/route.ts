import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  // Dynamically determine base URL from request, or use environment variable
  const requestUrl = new URL(request.url);
  let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  
  // If not set, use the request URL host (this will automatically use the correct port)
  if (!baseUrl) {
    baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
  }
  
  const redirectUri = `${baseUrl}/api/auth/google/callback`;
  
  // Log for debugging
  console.log('🔍 OAuth Route Debug:');
  console.log('  Request URL:', request.url);
  console.log('  Request Host:', requestUrl.host);
  console.log('  Base URL:', baseUrl);
  console.log('  Redirect URI:', redirectUri);

  console.log('Environment check:', {
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
    clientIdLength: clientId?.length || 0,
    baseUrl,
    redirectUri,
  });

  console.log('');
  console.log('⚠️⚠️⚠️ CRITICAL: Copy this EXACT redirect URI to Google Cloud Console ⚠️⚠️⚠️');
  console.log('');
  console.log('   Authorized redirect URI:');
  console.log(`   ${redirectUri}`);
  console.log('');
  console.log('   Authorized JavaScript origin:');
  console.log(`   ${baseUrl}`);
  console.log('');
  console.log('📋 Steps to fix:');
  console.log('   1. Go to Google Cloud Console → APIs & Services → Credentials');
  console.log('   2. Click on your OAuth 2.0 Client ID');
  console.log('   3. Add the redirect URI above to "Authorized redirect URIs"');
  console.log('   4. Add the origin above to "Authorized JavaScript origins"');
  console.log('   5. Wait 1-2 minutes for changes to propagate');
  console.log('');

  if (!clientId || !clientSecret) {
    console.error('Google OAuth credentials not configured');
    console.error('Client ID:', clientId ? 'EXISTS' : 'MISSING');
    console.error('Client Secret:', clientSecret ? 'EXISTS' : 'MISSING');
    return NextResponse.redirect(new URL('/login?error=oauth_not_configured', request.url));
  }

  const client = new OAuth2Client(clientId, clientSecret, redirectUri);

  // Generate OAuth URL
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
    prompt: 'consent',
  });

  console.log('🔗 Generated OAuth URL:', authUrl);
  console.log('   Redirect URI in request:', redirectUri);
  console.log('');
  console.log('✅ Make sure the redirect URI above matches EXACTLY in Google Cloud Console');
  console.log('');

  return NextResponse.redirect(authUrl);
}

