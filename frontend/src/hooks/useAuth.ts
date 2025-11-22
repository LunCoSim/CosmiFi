import { useAccount, useSignMessage } from 'wagmi';

/**
 * Hook to generate authentication headers for API requests
 * Uses wallet signature for authentication
 */
export function useAuth() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  // Cache for recent signatures to prevent duplicate requests
  const signatureCache = new Map<string, { signature: string; timestamp: number }>();
  const CACHE_DURATION = 30000; // 30 seconds
  
  // Track failed signature attempts to prevent retry loops
  const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();
  const RETRY_COOLDOWN = 5000; // 5 seconds cooldown after failed attempt

  const getAuthHeaders = async (): Promise<HeadersInit> => {
    console.log('🔍 [DEBUG] getAuthHeaders called for address:', address);
    if (!address) {
      throw new Error('Wallet not connected');
    }

    const now = Date.now();
    
    // Check if user recently cancelled a signature request
    const failed = failedAttempts.get(address);
    if (failed && (now - failed.lastAttempt) < RETRY_COOLDOWN) {
      console.log('🔍 [DEBUG] User recently cancelled signature, blocking retry for address:', address);
      throw new Error('Authentication failed: User recently cancelled signature request. Please wait before trying again.');
    }

    // Check if we have a recent cached signature
    const cached = signatureCache.get(address);
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log('🔍 [DEBUG] Using cached signature for address:', address);
      const message = `Sign this message to authenticate with CosmiFi. Wallet: ${address} Timestamp: ${cached.timestamp}`;
      
      return {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        'X-Wallet-Address': address,
        'X-Message': message,
        'X-Actual-Signature': cached.signature,
      };
    }

    // Create a message to sign
    const timestamp = now;
    const message = `Sign this message to authenticate with CosmiFi. Wallet: ${address} Timestamp: ${timestamp}`;
    console.log('🔍 [DEBUG] Requesting signature for message:', message);
    
    try {
      // Sign the message
      console.log('🔍 [DEBUG] Calling signMessageAsync...');
      const signature = await signMessageAsync({ message });
      console.log('🔍 [DEBUG] Signature received successfully');
      
      // Cache the signature
      signatureCache.set(address, { signature, timestamp });
      
      // Clear any previous failed attempts on successful signature
      failedAttempts.delete(address);

      // Use the Supabase anonymous key directly as the Authorization header
      // This bypasses JWT verification entirely
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      return {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'X-Wallet-Address': address,
        'X-Message': message,
        'X-Actual-Signature': signature, // Keep the actual signature for our custom auth
      };
    } catch (error: any) {
      console.error('Failed to sign message:', error);
      
      // Track failed attempts, especially user cancellations
      const currentFailed = failedAttempts.get(address) || { count: 0, lastAttempt: 0 };
      failedAttempts.set(address, {
        count: currentFailed.count + 1,
        lastAttempt: now
      });
      
      // Check if it's a user rejection
      if (error.message?.includes('User rejected') || error.message?.includes('User rejected request')) {
        throw new Error('Authentication failed: User rejected signature');
      }
      
      throw new Error('Authentication failed: Unable to sign message');
    }
  };

  return {
    address,
    getAuthHeaders,
    isConnected: !!address,
  };
}
