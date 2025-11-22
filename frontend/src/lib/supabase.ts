import { createClient } from '@supabase/supabase-js';

// Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not configured. Backend integration will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We use wallet-based auth, not session-based
    autoRefreshToken: false,
  },
});

// Helper to get auth headers with wallet signature
export async function getAuthHeaders(walletAddress: string, signature: string) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${signature}`,
    'X-Wallet-Address': walletAddress,
  };
}
