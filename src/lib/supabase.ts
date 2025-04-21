
import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key from the integrations file
const SUPABASE_URL = "https://zjmkdmmnajzevoupgfhg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqbWtkbW1uYWp6ZXZvdXBnZmhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2OTY1NjEsImV4cCI6MjA2MDI3MjU2MX0.b-Vf2q8nQ7mbhehpA_SJ27gpvu7KgWCV9tNxUKsWRa4";

// Initialize Supabase client with explicit auth options for better session handling
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
});
