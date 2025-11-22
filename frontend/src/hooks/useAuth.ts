import { useAccount, useSignMessage } from 'wagmi';

/**
 * Hook to generate authentication headers for API requests
 * Uses wallet signature for authentication
 */
export function useAuth() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const getAuthHeaders = async (): Promise<HeadersInit> => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    // Create a message to sign
    const message = `Sign this message to authenticate with CosmiFi.\n\nWallet: ${address}\nTimestamp: ${Date.now()}`;
    
    try {
      // Sign the message
      const signature = await signMessageAsync({ message });

      return {
        'Authorization': `Bearer ${signature}`,
        'X-Wallet-Address': address,
        'X-Message': message,
      };
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw new Error('Authentication failed: User rejected signature');
    }
  };

  return {
    address,
    getAuthHeaders,
    isConnected: !!address,
  };
}
