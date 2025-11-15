import { Address } from 'viem';

export interface NFT {
  tokenId: bigint;
  collectionAddress: Address;
  name: string;
  description?: string;
  image?: string;
  animationUrl?: string;
  externalUrl?: string;
  attributes?: NFTAttribute[];
  creator?: Address;
  owner?: Address;
  mintedAt?: number;
  price?: string;
  isListed?: boolean;
}

export interface NFTAttribute {
  trait_type: string;
  value: string;
  display_type?: string;
}

export interface NFTMetadata {
  name: string;
  description?: string;
  image?: string;
  animation_url?: string;
  external_url?: string;
  attributes?: NFTAttribute[];
  background_color?: string;
  youtube_url?: string;
}

export interface MintNFTData {
  name: string;
  description: string;
  category: string;
  tags: string[];
  license: string;
  image?: File;
  animation?: File;
}

export interface NFTCategory {
  id: string;
  name: string;
  description?: string;
}

export interface NFTLicense {
  id: string;
  name: string;
  description?: string;
  url?: string;
}

export interface NFTListing {
  nft: NFT;
  seller: Address;
  price: string;
  startTime: number;
  endTime?: number;
  isActive: boolean;
}