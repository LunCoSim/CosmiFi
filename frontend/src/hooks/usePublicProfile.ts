import { useEffect, useState, useCallback } from 'react';
import { profileService } from '../services/profileService';
import type { Profile } from '../types/api';

// Simple cache to store public profiles
const publicProfileCache = new Map<string, Profile>();

export function usePublicProfile(walletAddress?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicProfile = useCallback(async (address: string) => {
    // Check cache first
    if (publicProfileCache.has(address)) {
      console.log('🔍 [DEBUG] Using cached public profile for:', address);
      setProfile(publicProfileCache.get(address)!);
      return;
    }

    console.log('🔍 [DEBUG] Fetching public profile for:', address);
    setIsLoading(true);
    setError(null);

    try {
      // Call profile service WITHOUT authentication headers for public viewing
      const fetchedProfile = await profileService.getPublicProfile(address);
      
      if (fetchedProfile) {
        // Cache the public profile
        publicProfileCache.set(address, fetchedProfile);
        setProfile(fetchedProfile);
      } else {
        // Profile doesn't exist - create a default one
        const defaultProfile: Profile = {
          wallet_address: address,
          username: `Designer${address.slice(0, 6)}`,
          bio: '',
          social_links: {},
        };
        setProfile(defaultProfile);
      }
    } catch (err) {
      console.error('Failed to fetch public profile:', err);
      
      // Don't show error to user if backend is unavailable - just use default profile
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
      if (!errorMessage.includes('backend may not be deployed') && !errorMessage.includes('endpoint not found')) {
        setError(errorMessage);
      }
      
      // Fallback to default profile on error
      const defaultProfile: Profile = {
        wallet_address: address,
        username: `Designer${address.slice(0, 6)}`,
        bio: '',
        social_links: {},
      };
      setProfile(defaultProfile);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (walletAddress) {
      fetchPublicProfile(walletAddress);
    } else {
      setProfile(null);
    }
  }, [walletAddress, fetchPublicProfile]);

  const refetch = useCallback(() => {
    if (walletAddress) {
      // Clear cache and refetch
      publicProfileCache.delete(walletAddress);
      fetchPublicProfile(walletAddress);
    }
  }, [walletAddress, fetchPublicProfile]);

  return {
    profile,
    isLoading,
    error,
    refetch,
  };
}