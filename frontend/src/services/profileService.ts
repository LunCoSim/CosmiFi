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
  async getProfile(walletAddress: string): Promise<Profile | null> {
    try {
      const response = await api.get<{ profile: Profile }>('profiles/get-profile', {
        wallet_address: walletAddress,
      });
      return response.profile;
    } catch (error: any) {
      // Return null if profile not found (404)
      if (error.status === 404) {
        return null;
      }
      throw error;
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

    const response = await api.upload<{ avatarUrl: string; cid: string }>(
      'profiles/upload-avatar',
      formData,
      authHeaders
    );
    return response;
  },
};
