// API response types matching backend

export interface Profile {
  wallet_address: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  website?: string;
  email?: string;
  social_links?: {
    twitter?: string;
    farcaster?: string;
    gmail?: string;
    [key: string]: string | undefined;
  };
  is_designer?: boolean;
  verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Design {
  id: number;
  token_id?: number;
  owner_address: string;
  metadata_cid?: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  version: string;
  license: string;
  preview_cid?: string;
  cad_zip_cid?: string;
  status: 'draft' | 'uploaded' | 'metadata_ready' | 'minted';
  collection_address?: string;
  created_at: string;
  updated_at: string;
  minted_at?: string;
}

export interface DesignsResponse {
  items: Design[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface FileUploadResponse {
  cadZipCid: string;
  previewCid: string;
  cadSize: number;
  previewSize: number;
}

export interface MetadataResponse {
  metadataCid: string;
  metadata: NFTMetadata;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  cad_zip: string;
  creator: string;
  category: string;
  version: string;
  tags: string[];
  license: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

export interface CreateDesignRequest {
  name: string;
  description: string;
  category: string;
  tags?: string[];
  version?: string;
  license?: string;
  previewCid: string;
  cadZipCid: string;
}

export interface UpdateDesignRequest {
  id: number;
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  version?: string;
  license?: string;
  status?: 'draft' | 'uploaded' | 'metadata_ready' | 'minted';
}

export interface UpdateProfileRequest {
  username?: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  website?: string;
  email?: string;
  social_links?: {
    twitter?: string;
    farcaster?: string;
    gmail?: string;
    [key: string]: string | undefined;
  };
}

export interface GenerateMetadataRequest {
  name: string;
  description: string;
  category: string;
  tags: string[];
  version: string;
  license: string;
  previewCid: string;
  cadZipCid: string;
}
