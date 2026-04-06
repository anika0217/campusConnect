// Fallback API using Supabase client directly (no Edge Functions required)
import { createClient } from './supabase/client';

let supabase: ReturnType<typeof createClient> | null = null;

// Safely get Supabase client with error handling
function getSupabaseClient() {
  try {
    if (!supabase) {
      supabase = createClient();
    }
    return supabase;
  } catch (error) {
    console.log('⚠️ Supabase client unavailable, using localStorage only');
    return null;
  }
}

export const fallbackApi = {
  // Auth - use Supabase Auth directly
  register: async (email: string, password: string, name: string, role: string, year?: string, branch?: string, batch?: string) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('Authentication service is unavailable. Please try again later.');
      }

      // Prepare user metadata - include all fields for student
      const userMetadata: any = { 
        name, 
        role
      };
      
      // IMPORTANT: For students, always include year, branch, and batch in metadata
      if (role === 'student') {
        if (!year || !branch || !batch) {
          throw new Error('Year, branch, and batch are required for student accounts');
        }
        userMetadata.year = year;
        userMetadata.branch = branch;
        userMetadata.batch = batch;
      } else {
        // For faculty/admin, only add if provided
        if (year) userMetadata.year = year;
        if (branch) userMetadata.branch = branch;
        if (batch) userMetadata.batch = batch;
      }

      console.log('📝 Registering user with metadata:', userMetadata);

      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: userMetadata,
          emailRedirectTo: undefined // Disable email confirmation redirect
        }
      });

      if (error) {
        console.error('❌ Supabase signUp error:', error);
        throw error;
      }
      
      console.log('✅ User created in Supabase Auth');

      // Check if email confirmation is required
      if (data.user && !data.session) {
        console.log('ℹ️ Email confirmation is enabled in Supabase settings.');
        console.log('✅ User account created successfully with all metadata.');
        console.log('💡 User will need to confirm email before they can login.');
        console.log('💡 To skip email confirmation: Disable it in Supabase Auth settings.');
        // User created but needs email confirmation
        // We can't store in kv_store without a session (RLS will block it)
        // That's OK - user_metadata has all the info we need
      }

      // Store additional user data in database ONLY if we have a session
      // (Otherwise RLS will block the insert)
      if (data.user && data.session) {
        const userData: any = {
          id: data.user.id,
          email,
          name,
          role,
          created_at: new Date().toISOString()
        };
        if (year) userData.year = year;
        if (branch) userData.branch = branch;
        if (batch) userData.batch = batch;

        console.log('📝 Attempting to store user data in kv_store...');

        try {
          const { error: dbError } = await client.from('kv_store_d0447a48').upsert({
            key: `user:${data.user.id}`,
            value: userData
          });

          if (dbError) {
            // RLS policy error or table doesn't exist
            // This is NOT a critical error - user_metadata has all the data we need
            console.log('ℹ️ Could not store in kv_store:', dbError.message);
            console.log('✅ No problem! All user data is safely stored in user_metadata');
            console.log('💡 Database is optional for auth - app will work without it');
          } else {
            console.log('✅ User data stored in kv_store successfully');
          }
        } catch (dbException) {
          // Network error or table doesn't exist - not critical
          console.log('ℹ️ Database not available (this is OK, app uses auth metadata)');
        }
      } else if (data.user && !data.session) {
        console.log('⏭️ Skipping kv_store write (no session due to email confirmation)');
      }

      return {
        success: true,
        user: {
          id: data.user?.id,
          email,
          name,
          role,
          year: year || null,
          branch: branch || null,
          batch: batch || null
        },
        session: data.session ? true : false,
        message: data.session ? 'Account created successfully!' : 'Account created! Please check your email to confirm your account before logging in.'
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  },

  // Bookings - with localStorage fallback
  getBookings: async () => {
    const client = getSupabaseClient();
    
    // If no client available, use localStorage only
    if (!client) {
      console.log('ℹ️ Supabase unavailable, using localStorage only');
      const localBookings = localStorage.getItem('campusconnect_bookings');
      return { 
        bookings: localBookings ? JSON.parse(localBookings) : [],
        source: 'localStorage'
      };
    }

    try {
      // Try to fetch from Supabase first
      const { data, error } = await client
        .from('kv_store_d0447a48')
        .select('value')
        .like('key', 'booking:%');

      if (error) {
        // Database not available, use localStorage
        console.log('ℹ️ Could not fetch bookings from database:', error.message);
        console.log('💡 Using localStorage instead.');
        
        const localBookings = localStorage.getItem('campusconnect_bookings');
        return { 
          bookings: localBookings ? JSON.parse(localBookings) : [],
          source: 'localStorage'
        };
      }

      const dbBookings = data?.map(row => row.value) || [];
      
      // Also merge with localStorage bookings (in case some were saved there)
      const localBookings = localStorage.getItem('campusconnect_bookings');
      if (localBookings) {
        const localData = JSON.parse(localBookings);
        // Merge, avoiding duplicates
        const merged = [...dbBookings];
        localData.forEach((lb: any) => {
          if (!merged.some(b => b.id === lb.id)) {
            merged.push(lb);
          }
        });
        return { bookings: merged, source: 'database+localStorage' };
      }

      return {
        bookings: dbBookings,
        source: 'database'
      };
    } catch (error: any) {
      console.log('ℹ️ Network error, using localStorage');
      const localBookings = localStorage.getItem('campusconnect_bookings');
      return { 
        bookings: localBookings ? JSON.parse(localBookings) : [],
        source: 'localStorage'
      };
    }
  },

  createBooking: async (booking: any, accessToken: string) => {
    try {
      const client = getSupabaseClient();
      
      // Get user info
      let userId = 'anonymous';
      if (client) {
        try {
          const { data: { user } } = await client.auth.getUser(accessToken);
          if (user) userId = user.id;
        } catch (authError) {
          console.log('⚠️ Could not verify user, proceeding with anonymous ID');
        }
      }

      const bookingId = `booking:${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const bookingData = {
        ...booking,
        id: bookingId,
        createdBy: userId,
        createdAt: new Date().toISOString()
      };

      // Try to save to Supabase first if client is available
      if (client) {
        try {
          const { error } = await client.from('kv_store_d0447a48').upsert({
            key: bookingId,
            value: bookingData
          });

          if (error) {
            // RLS policy error or other database error
            console.log('⚠️ Database save failed (RLS policy):', error.message);
            console.log('💡 Saving to localStorage instead...');
            throw error; // Fall through to localStorage save
          }

          console.log('✅ Booking saved to database');
          
          // Also save to localStorage as backup
          const localBookings = localStorage.getItem('campusconnect_bookings');
          const bookings = localBookings ? JSON.parse(localBookings) : [];
          bookings.push(bookingData);
          localStorage.setItem('campusconnect_bookings', JSON.stringify(bookings));
          
          return { success: true, bookingId, source: 'database' };
        } catch (dbError: any) {
          // Database failed, use localStorage
          console.log('💾 Saving to localStorage (database unavailable)');
          
          const localBookings = localStorage.getItem('campusconnect_bookings');
          const bookings = localBookings ? JSON.parse(localBookings) : [];
          bookings.push(bookingData);
          localStorage.setItem('campusconnect_bookings', JSON.stringify(bookings));
          
          return { success: true, bookingId, source: 'localStorage' };
        }
      } else {
        // No client available, save directly to localStorage
        console.log('💾 Saving to localStorage (Supabase unavailable)');
        
        const localBookings = localStorage.getItem('campusconnect_bookings');
        const bookings = localBookings ? JSON.parse(localBookings) : [];
        bookings.push(bookingData);
        localStorage.setItem('campusconnect_bookings', JSON.stringify(bookings));
        
        return { success: true, bookingId, source: 'localStorage' };
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create booking');
    }
  },

  updateBooking: async (id: string, updates: any, accessToken: string) => {
    try {
      const client = getSupabaseClient();
      
      let userId = 'anonymous';
      if (client) {
        try {
          const { data: { user } } = await client.auth.getUser(accessToken);
          if (user) userId = user.id;
        } catch (authError) {
          console.log('⚠️ Could not verify user');
        }
      }

      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString(),
        updatedBy: userId
      };

      // Try database first if client available
      if (client) {
        try {
          const { data: existing, error: fetchError } = await client
            .from('kv_store_d0447a48')
            .select('value')
            .eq('key', `booking:${id}`)
            .single();

          if (fetchError) throw fetchError;

          const { error } = await client.from('kv_store_d0447a48').upsert({
            key: `booking:${id}`,
            value: {
              ...existing.value,
              ...updatedData
            }
          });

          if (error) throw error;

          // Also update localStorage
          const localBookings = localStorage.getItem('campusconnect_bookings');
          if (localBookings) {
            const bookings = JSON.parse(localBookings);
            const index = bookings.findIndex((b: any) => b.id === id);
            if (index !== -1) {
              bookings[index] = { ...bookings[index], ...updatedData };
              localStorage.setItem('campusconnect_bookings', JSON.stringify(bookings));
            }
          }

          return { success: true, source: 'database' };
        } catch (dbError) {
          // Update in localStorage only
          console.log('💾 Updating in localStorage (database unavailable)');
          const localBookings = localStorage.getItem('campusconnect_bookings');
          if (localBookings) {
            const bookings = JSON.parse(localBookings);
            const index = bookings.findIndex((b: any) => b.id === id);
            if (index !== -1) {
              bookings[index] = { ...bookings[index], ...updatedData };
              localStorage.setItem('campusconnect_bookings', JSON.stringify(bookings));
              return { success: true, source: 'localStorage' };
            }
          }
          throw new Error('Booking not found');
        }
      } else {
        // No client, update localStorage only
        console.log('💾 Updating in localStorage (Supabase unavailable)');
        const localBookings = localStorage.getItem('campusconnect_bookings');
        if (localBookings) {
          const bookings = JSON.parse(localBookings);
          const index = bookings.findIndex((b: any) => b.id === id);
          if (index !== -1) {
            bookings[index] = { ...bookings[index], ...updatedData };
            localStorage.setItem('campusconnect_bookings', JSON.stringify(bookings));
            return { success: true, source: 'localStorage' };
          }
        }
        throw new Error('Booking not found');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update booking');
    }
  },

  deleteBooking: async (id: string, accessToken: string) => {
    try {
      const client = getSupabaseClient();

      // Try database first if client available
      if (client) {
        try {
          const { error } = await client
            .from('kv_store_d0447a48')
            .delete()
            .eq('key', `booking:${id}`);

          if (error) throw error;

          // Also delete from localStorage
          const localBookings = localStorage.getItem('campusconnect_bookings');
          if (localBookings) {
            const bookings = JSON.parse(localBookings);
            const filtered = bookings.filter((b: any) => b.id !== id);
            localStorage.setItem('campusconnect_bookings', JSON.stringify(filtered));
          }

          return { success: true, source: 'database' };
        } catch (dbError) {
          // Delete from localStorage only
          console.log('💾 Deleting from localStorage (database unavailable)');
          const localBookings = localStorage.getItem('campusconnect_bookings');
          if (localBookings) {
            const bookings = JSON.parse(localBookings);
            const filtered = bookings.filter((b: any) => b.id !== id);
            localStorage.setItem('campusconnect_bookings', JSON.stringify(filtered));
            return { success: true, source: 'localStorage' };
          }
          throw new Error('Booking not found');
        }
      } else {
        // No client, delete from localStorage only
        console.log('💾 Deleting from localStorage (Supabase unavailable)');
        const localBookings = localStorage.getItem('campusconnect_bookings');
        if (localBookings) {
          const bookings = JSON.parse(localBookings);
          const filtered = bookings.filter((b: any) => b.id !== id);
          localStorage.setItem('campusconnect_bookings', JSON.stringify(filtered));
          return { success: true, source: 'localStorage' };
        }
        throw new Error('Booking not found');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete booking');
    }
  },
};
