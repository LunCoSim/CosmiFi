import { useAccount } from 'wagmi';
import { useEffect, useState, useCallback } from 'react';
import { profileService } from '../services/profileService';
import { useAuth } from './useAuth';
import type { Profile } from '../types/api';

// Simple cache to store profiles
const profileCache = new Map<string, Profile>();

export function useProfile() {
  const { address } = useAccount();
  const { getAuthHeaders } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (walletAddress: string) => {
    console.log('🔍 [DEBUG] fetchProfile called for walletAddress:', walletAddress);
    console.log('🔍 [DEBUG] Profile cache size:', profileCache.size);
    console.log('🔍 [DEBUG] Cache has walletAddress:', profileCache.has(walletAddress));
    
    // Check cache first
    if (profileCache.has(walletAddress)) {
      console.log('🔍 [DEBUG] Using cached profile for:', walletAddress);
      setProfile(profileCache.get(walletAddress)!);
      return;
    }

    console.log('🔍 [DEBUG] Fetching profile from API for:', walletAddress);
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 [DEBUG] Getting auth headers...');
      const authHeaders = await getAuthHeaders();
      console.log('🔍 [DEBUG] Auth headers received, calling profileService.getProfile...');
      const fetchedProfile = await profileService.getProfile(walletAddress, authHeaders);
      
      if (fetchedProfile) {
        // Cache the profile
        profileCache.set(walletAddress, fetchedProfile);
        setProfile(fetchedProfile);
      } else {
        // Profile doesn't exist yet - create a default one
        const defaultProfile: Profile = {
          wallet_address: walletAddress,
          username: `Designer${walletAddress.slice(0, 6)}`,
          bio: '',
          social_links: {},
        };
        setProfile(defaultProfile);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      
      // Don't show error to user if backend is unavailable - just use default profile
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
      if (!errorMessage.includes('backend may not be deployed') && !errorMessage.includes('endpoint not found')) {
        setError(errorMessage);
      }
      
      // Fallback to default profile on error
      const defaultProfile: Profile = {
        wallet_address: walletAddress,
        username: `Designer${walletAddress.slice(0, 6)}`,
        bio: '',
        social_links: {},
      };
      setProfile(defaultProfile);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Removed first useEffect - consolidated with the one below to prevent duplicate fetches

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const authHeaders = await getAuthHeaders();
      
      // Clear cache to ensure fresh data is fetched
      profileCache.delete(address);
      
      // If profile doesn't exist yet, create it
      if (!profile?.wallet_address || profile.wallet_address !== address) {
        const newProfile = await profileService.createProfile(
          address,
          updates,
          authHeaders
        );
        profileCache.set(address, newProfile);
        setProfile(newProfile);
      } else {
        // Update existing profile
        const updatedProfile = await profileService.updateProfile(
          updates,
          authHeaders
        );
        profileCache.set(address, updatedProfile);
        setProfile(updatedProfile);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address, profile, getAuthHeaders]);

  const uploadAvatar = useCallback(async (file: File) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const authHeaders = await getAuthHeaders();
      const { avatarUrl } = await profileService.uploadAvatar(file, authHeaders);
      
      // Clear cache to ensure fresh data is fetched
      profileCache.delete(address);
      
      // Update profile with new avatar URL
      await updateProfile({ avatar_url: avatarUrl });
      
      return avatarUrl;
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address, getAuthHeaders, updateProfile]);

  const refetch = useCallback(() => {
    if (address) {
      // Clear cache and refetch
      profileCache.delete(address);
      fetchProfile(address);
    }
  }, [address, fetchProfile]);

  // Single useEffect to handle profile fetching
  useEffect(() => {
    console.log('🔍 [DEBUG] useProfile useEffect triggered with address:', address);
    if (address) {
      // Only clear cache on initial mount, not on every address change
      const isInitialMount = !profileCache.has(address) && !profile;
      if (isInitialMount) {
        console.log('🔍 [DEBUG] Initial mount - clearing profile cache for address:', address);
        profileCache.delete(address);
      }
      fetchProfile(address);
    } else {
      setProfile(null);
    }
  }, [address, fetchProfile, profile]);

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    uploadAvatar,
    refetch,
  };
}