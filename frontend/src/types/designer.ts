import { Address } from 'viem';

export interface Designer {
  address: Address;
  name?: string;
  bio?: string;
  email?: string;
  website?: string;
  twitter?: string;
  avatarUrl?: string;
  isRegistered: boolean;
  registeredAt?: number;
  collections: Address[];
}

export interface DesignerProfile {
  username: string;
  bio: string;
  email?: string;
  website?: string;
  twitter?: string;
  avatarUrl?: string;
  social_links?: {
    twitter?: string;
    farcaster?: string;
    gmail?: string;
  };
}

export interface DesignerRegistration {
  profile: DesignerProfile;
  signature?: string;
}