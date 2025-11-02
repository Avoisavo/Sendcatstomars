export interface UserData {
  email: string;
  name: string;
  picture: string;
  id: string;
}

export function getUserData(): UserData | null {
  if (typeof window === 'undefined') return null;
  
  // Get the userData cookie
  const cookies = document.cookie.split(';');
  const userDataCookie = cookies.find(cookie => 
    cookie.trim().startsWith('userData=')
  );
  
  if (!userDataCookie) return null;
  
  try {
    const userDataString = decodeURIComponent(userDataCookie.split('=')[1]);
    const userData: UserData = JSON.parse(userDataString);
    return userData;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getUserData() !== null;
}

export function logout(): void {
  // Clear cookies
  document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'userData=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  // Redirect to login
  window.location.href = '/login';
}

export function getUserName(): string | null {
  const userData = getUserData();
  return userData?.name || null;
}

export function getUserEmail(): string | null {
  const userData = getUserData();
  return userData?.email || null;
}

