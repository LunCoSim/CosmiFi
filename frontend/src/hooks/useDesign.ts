import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { designService } from '../services/designService';
import { useAuth } from './useAuth';
import type {
  Design,
  DesignsResponse,
  CreateDesignRequest,
  UpdateDesignRequest,
  FileUploadResponse,
  MetadataResponse,
} from '../types/api';

export interface UploadProgress {
  stage: 'idle' | 'uploading_files' | 'creating_draft' | 'generating_metadata' | 'complete' | 'error';
  progress: number;
  message: string;
}

/**
 * Hook for managing design uploads and operations
 */
export function useDesign() {
  const { address } = useAccount();
  const { getAuthHeaders } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    stage: 'idle',
    progress: 0,
    message: '',
  });

  /**
   * Get designs with optional filters
   */
  const getDesigns = useCallback(async (params?: {
    owner?: string;
    status?: string;
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<DesignsResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const designs = await designService.getDesigns(params);
      return designs;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch designs';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get user's designs
   */
  const getMyDesigns = useCallback(async (status?: string): Promise<DesignsResponse> => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    return getDesigns({ owner: address, status });
  }, [address, getDesigns]);

  /**
   * Upload a new design (complete workflow)
   */
  const uploadDesign = useCallback(async (
    cadFile: File,
    previewFile: File,
    metadata: Omit<CreateDesignRequest, 'previewCid' | 'cadZipCid'>
  ): Promise<Design> => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const authHeaders = await getAuthHeaders();

      // Step 1: Upload files to IPFS
      setUploadProgress({
        stage: 'uploading_files',
        progress: 25,
        message: 'Uploading files to IPFS...',
      });

      const fileUploadResult: FileUploadResponse = await designService.uploadFiles(
        cadFile,
        previewFile,
        authHeaders
      );

      // Step 2: Create design draft in database
      setUploadProgress({
        stage: 'creating_draft',
        progress: 50,
        message: 'Creating design draft...',
      });

      const designData: CreateDesignRequest = {
        ...metadata,
        previewCid: fileUploadResult.previewCid,
        cadZipCid: fileUploadResult.cadZipCid,
      };

      const design = await designService.createDraft(designData, authHeaders);

      // Step 3: Generate NFT metadata
      setUploadProgress({
        stage: 'generating_metadata',
        progress: 75,
        message: 'Generating NFT metadata...',
      });

      const metadataResult: MetadataResponse = await designService.generateMetadata(
        {
          name: metadata.name,
          description: metadata.description,
          category: metadata.category,
          tags: metadata.tags || [],
          version: metadata.version || 'v1.0',
          license: metadata.license || 'CC-BY-4.0',
          previewCid: fileUploadResult.previewCid,
          cadZipCid: fileUploadResult.cadZipCid,
        },
        authHeaders
      );

      // Step 4: Update design with metadata CID and status
      const updatedDesign = await designService.updateDesign(
        {
          id: design.id,
          status: 'metadata_ready',
        },
        authHeaders
      );

      setUploadProgress({
        stage: 'complete',
        progress: 100,
        message: 'Design uploaded successfully!',
      });

      return updatedDesign;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload design';
      setError(errorMessage);
      setUploadProgress({
        stage: 'error',
        progress: 0,
        message: errorMessage,
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address, getAuthHeaders]);

  /**
   * Update an existing design
   */
  const updateDesign = useCallback(async (
    updates: UpdateDesignRequest
  ): Promise<Design> => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const authHeaders = await getAuthHeaders();
      const design = await designService.updateDesign(updates, authHeaders);
      return design;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update design';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address, getAuthHeaders]);

  /**
   * Reset upload progress
   */
  const resetUploadProgress = useCallback(() => {
    setUploadProgress({
      stage: 'idle',
      progress: 0,
      message: '',
    });
  }, []);

  return {
    getDesigns,
    getMyDesigns,
    uploadDesign,
    updateDesign,
    isLoading,
    error,
    uploadProgress,
    resetUploadProgress,
  };
}
