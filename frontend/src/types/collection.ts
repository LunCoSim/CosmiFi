import { Address } from 'viem';

export interface Collection {
  address: Address;
  name: string;
  symbol: string;
  description?: string;
  designer: Address;
  totalSupply: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface CreateCollectionData {
  name: string;
  symbol: string;
  description: string;
}

export interface CollectionMetadata {
  name: string;
  description: string;
  image?: string;
  external_url?: string;
  attributes?: {
    trait_type: string;
    value: string;
  }[];
}

export interface CollectionStats {
  totalSupply: number;
  owners: number;
  floorPrice?: string;
  volume24h?: string;
  volume7d?: string;
  totalVolume?: string;
}