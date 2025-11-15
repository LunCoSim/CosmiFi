export interface UserProfile {
  wallet_address: string
  username?: string
  bio?: string
  avatar_url?: string
  social_links?: Record<string, string>
  is_designer?: boolean
  created_at: string
  updated_at: string
}

export interface Design {
  id: number
  token_id?: number
  owner_address: string
  metadata_cid?: string
  name?: string
  description?: string
  category?: string
  tags?: string[]
  version?: string
  license?: string
  preview_cid?: string
  cad_zip_cid?: string
  status: 'draft' | 'uploaded' | 'metadata_ready' | 'minted'
  created_at: string
  updated_at: string
  minted_at?: string
  collection_address?: string
}

export interface NFTMetadata {
  name: string
  description: string
  image: string // IPFS URL
  cad_zip: string // IPFS URL
  creator: string // Wallet address
  category: string
  version: string
  tags: string[]
  license: string
  attributes?: Array<{
    trait_type: string
    value: string
  }>
}

export interface PinataResponse {
  IpfsHash: string
  PinSize: number
  Timestamp: string
}

import { Payload } from 'https://deno.land/x/djwt@v2.8/mod.ts'

export interface JWTPayload extends Payload {
  wallet_address: string
  user_id?: string
  role?: string
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: string
    user_metadata: {
      wallet_address: string
    }
  }
}

export interface WalletVerificationRequest {
  walletAddress: string
  signature: string
  message: string
}

export interface WalletVerificationResponse {
  token: string
  profile: UserProfile | null
  isNewUser: boolean
}

export interface FileUploadResponse {
  cadZipCid: string
  previewCid: string
  cadSize: number
  previewSize: number
}

export interface MetadataRequest {
  name: string
  description: string
  category: string
  tags: string[]
  version: string
  license: string
  previewCid: string
  cadZipCid: string
  additionalNotes?: string
}

export interface MetadataResponse {
  metadataCid: string
  metadata: NFTMetadata
}

export interface DesignDraftRequest {
  name: string
  description: string
  category: string
  tags: string[]
  version: string
  license: string
  previewCid: string
  cadZipCid: string
}

export interface PrepareMintRequest {
  designId: number
  metadataCid: string
}

export interface NFTMintedWebhook {
  tokenId: number
  owner: string
  metadataCid: string
  collectionAddress: string
  transactionHash: string
  blockNumber: number
}

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  status: 'success' | 'error'
}

export interface PaginatedResponse<T> {
  data: {
    items: T[]
    total: number
    limit: number
    offset: number
  }
  status: 'success'
}