
import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks to prevent runtime errors
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize Supabase client with placeholder if needed
let supabase: ReturnType<typeof createClient>;

try {
  // Only create the client if we have valid values
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      'Missing Supabase environment variables. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
    );
    // Create a mock client that doesn't throw errors but doesn't work either
    supabase = {
      auth: {
        signInWithPassword: async () => ({ error: { message: 'Supabase not configured' }, data: null }),
        signUp: async () => ({ error: { message: 'Supabase not configured' }, data: null }),
        signOut: async () => ({ error: null }),
        getSession: () => ({ data: { session: null }, error: null }),
      },
    } as any;
  } else {
    // Create the real client when we have proper credentials
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  // Fallback to mock client
  supabase = {
    auth: {
      signInWithPassword: async () => ({ error: { message: 'Supabase configuration error' }, data: null }),
      signUp: async () => ({ error: { message: 'Supabase configuration error' }, data: null }),
      signOut: async () => ({ error: null }),
      getSession: () => ({ data: { session: null }, error: null }),
    },
  } as any;
}

export { supabase };
