import { useAccount } from 'wagmi';
import { useEffect, useState, useMemo } from 'react';
import { DesignerProfile } from '../types/designer';

// Simple cache to store profiles
const profileCache = new Map<string, DesignerProfile>();

export function useProfile() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profile = useMemo(() => {
    if (!address) return null;
    
    // Check cache first
    if (profileCache.has(address)) {
      return profileCache.get(address)!;
    }
    
    // Generate mock profile if not in cache
    const mockProfile: DesignerProfile = {
      username: `Designer${address.slice(0, 6)}`,
      bio: 'Passionate engineer creating innovative space mission designs for future of space exploration.',
      website: 'https://cosmifi.io',
      twitter: '@cosmifi',
      avatarUrl: `https://api.dicebear.com/7.x?seed=${address}&format=svg`,
      social_links: {
        twitter: '@cosmifi',
        farcaster: 'cosmifi',
        gmail: 'contact@cosmifi.io'
      }
    };
    
    // Cache the profile
    profileCache.set(address, mockProfile);
    return mockProfile;
  }, [address]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!address) {
        return;
      }

      // Skip if already cached
      if (profileCache.has(address)) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // TODO: Replace with actual API call to backend
        // For now, we're using the memoized mock data
        // No artificial delay needed
        await new Promise(resolve => setTimeout(resolve, 100)); // Minimal delay for loading state
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [address]);

  return {
    profile,
    isLoading,
    error,
    refetch: () => {
      // Clear cache and refetch
      if (address) {
        profileCache.delete(address);
      }
      // Trigger refetch by updating state
      setIsLoading(true);
      // The useEffect will handle the refetch
    }
  };
}