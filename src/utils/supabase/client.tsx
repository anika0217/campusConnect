import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  try {
    const supabaseUrl = `https://${projectId}.supabase.co`;
    
    supabaseClient = createSupabaseClient(supabaseUrl, publicAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false, // Prevents issues with redirect URLs
        storage: {
          // Wrap storage with error handling
          getItem: (key: string) => {
            try {
              return window.localStorage.getItem(key);
            } catch (error) {
              console.log('⚠️ Could not access localStorage:', error);
              return null;
            }
          },
          setItem: (key: string, value: string) => {
            try {
              window.localStorage.setItem(key, value);
            } catch (error) {
              console.log('⚠️ Could not write to localStorage:', error);
            }
          },
          removeItem: (key: string) => {
            try {
              window.localStorage.removeItem(key);
            } catch (error) {
              console.log('⚠️ Could not remove from localStorage:', error);
            }
          },
        },
      },
      global: {
        fetch: (url, options = {}) => {
          return fetch(url, {
            ...options,
            // Add timeout to prevent hanging
            signal: AbortSignal.timeout ? AbortSignal.timeout(10000) : undefined,
          }).catch((error) => {
            console.log('🌐 Network request failed (Supabase unavailable):', error.message);
            throw error;
          });
        },
      },
    });

    return supabaseClient;
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    throw error;
  }
}