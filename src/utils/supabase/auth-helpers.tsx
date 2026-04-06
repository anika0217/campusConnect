import { createClient } from './client';

/**
 * Safely checks session and clears invalid refresh tokens
 * @returns Session object if valid, null if invalid or error
 */
export async function checkAndClearInvalidSession() {
  try {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    // If error is related to refresh token, clear the session
    if (error) {
      if (error.message.includes('refresh') || error.message.includes('Refresh Token') || error.message.includes('Invalid')) {
        console.log('🔄 Detected invalid refresh token, clearing session...');
        try {
          await supabase.auth.signOut();
          console.log('✅ Invalid session cleared');
        } catch (signOutError) {
          console.log('⚠️ Could not sign out during cleanup:', signOutError);
        }
      }
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error checking session:', error);
    
    // Try to clear session if it's an auth error
    if (error instanceof Error && (error.message.includes('refresh') || error.message.includes('Invalid'))) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
        console.log('✅ Invalid session cleared after error');
      } catch (signOutError) {
        console.log('⚠️ Could not sign out during error cleanup:', signOutError);
      }
    }
    
    return null;
  }
}

/**
 * Gets the current access token, or returns null if no valid session
 */
export async function getAccessToken(): Promise<string | null> {
  const session = await checkAndClearInvalidSession();
  return session?.access_token || null;
}

/**
 * Checks if there's a valid user session
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await checkAndClearInvalidSession();
  return !!session?.user;
}
