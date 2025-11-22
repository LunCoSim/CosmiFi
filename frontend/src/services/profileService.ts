import { api } from '../lib/api';
import type {
  Profile,
  UpdateProfileRequest,
} from '../types/api';

/**
 * Profile API service
 */
export const profileService = {
  /**
   * Get profile by wallet address
   */
  async getProfile(walletAddress: string, authHeaders?: HeadersInit): Promise<Profile | null> {
    try {
      const response = await api.get<{ profile: Profile }>('profiles/get-profile', {
        wallet_address: walletAddress,
      }, authHeaders);
      return response.profile;
    } catch (error: any) {
      // Return null if profile not found (404)
      if (error.status === 404) {
        console.log(`Profile not found for ${walletAddress}, will use default`);
        return null;
      }
      
      // Log backend unavailability but don't throw - allow app to work with default profiles
      if (error.message?.includes('endpoint not found') || error.message?.includes('backend may not be deployed')) {
        console.warn('Backend API not available:', error.message);
        console.warn('Using default profile. To enable full profile features, deploy the backend.');
        return null;
      }
      
      // For other errors, log and return null to allow graceful degradation
      console.error('Error fetching profile:', error);
      return null;
    }
  },

  /**
   * Get public profile by wallet address (no authentication required)
   */
  async getPublicProfile(walletAddress: string): Promise<Profile | null> {
    try {
      const response = await api.getPublic<{ profile: Profile }>('profiles/get-profile', {
        wallet_address: walletAddress,
      });
      return response.profile;
    } catch (error: any) {
      // Return null if profile not found (404)
      if (error.status === 404) {
        console.log(`Public profile not found for ${walletAddress}, will use default`);
        return null;
      }
      
      // Log backend unavailability but don't throw - allow app to work with default profiles
      if (error.message?.includes('endpoint not found') || error.message?.includes('backend may not be deployed')) {
        console.warn('Backend API not available:', error.message);
        console.warn('Using default profile. To enable full profile features, deploy the backend.');
        return null;
      }
      
      // For other errors, log and return null to allow graceful degradation
      console.error('Error fetching public profile:', error);
      return null;
    }
  },

  /**
   * Create a new profile
   */
  async createProfile(
    walletAddress: string,
    data: Partial<UpdateProfileRequest>,
    authHeaders: HeadersInit
  ): Promise<Profile> {
    const response = await api.post<{ profile: Profile }>(
      'profiles/create-profile',
      {
        wallet_address: walletAddress,
        ...data,
      },
      authHeaders
    );
    return response.profile;
  },

  /**
   * Update profile
   */
  async updateProfile(
    data: UpdateProfileRequest,
    authHeaders: HeadersInit
  ): Promise<Profile> {
    const response = await api.put<{ profile: Profile }>(
      'profiles/update-profile',
      data,
      authHeaders
    );
    return response.profile;
  },

  /**
   * Upload avatar image
   */
  async uploadAvatar(
    file: File,
    authHeaders: HeadersInit
  ): Promise<{ avatarUrl: string; cid: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.upload<{ url: string; cid: string }>(
      'profiles/upload-avatar',
      formData,
      authHeaders
    );
    
    return {
      avatarUrl: response.url,
      cid: response.cid
    };
  },
};
