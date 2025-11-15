import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { DesignerProfile } from '../types/designer';

export function useProfile() {
  const { address } = useAccount();
  const [profile, setProfile] = useState<DesignerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!address) {
        setProfile(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // TODO: Replace with actual API call to backend
        // For now, return mock data based on wallet address
        const mockProfile: DesignerProfile = {
          username: `Designer${address.slice(0, 6)}`,
          bio: 'Passionate engineer creating innovative space mission designs for the future of space exploration.',
          website: 'https://cosmifi.io',
          twitter: '@cosmifi',
          avatarUrl: `https://api.dicebear.com/7.x?seed=${address}&format=svg`,
          social_links: {
            twitter: '@cosmifi',
            farcaster: 'cosmifi',
            gmail: 'contact@cosmifi.io'
          }
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setProfile(mockProfile);
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
      // TODO: Implement refetch logic
    }
  };
}