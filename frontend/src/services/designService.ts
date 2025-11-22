import { api } from '../lib/api';
import type {
  Design,
  DesignsResponse,
  CreateDesignRequest,
  UpdateDesignRequest,
  FileUploadResponse,
  MetadataResponse,
  GenerateMetadataRequest,
} from '../types/api';

/**
 * Design API service
 */
export const designService = {
  /**
   * Get designs with optional filters
   */
  async getDesigns(params?: {
    owner?: string;
    status?: string;
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<DesignsResponse> {
    const queryParams: Record<string, string> = {};
    
    if (params?.owner) queryParams.owner = params.owner;
    if (params?.status) queryParams.status = params.status;
    if (params?.category) queryParams.category = params.category;
    if (params?.search) queryParams.search = params.search;
    if (params?.limit) queryParams.limit = params.limit.toString();
    if (params?.offset) queryParams.offset = params.offset.toString();
    if (params?.sort_by) queryParams.sort_by = params.sort_by;
    if (params?.sort_order) queryParams.sort_order = params.sort_order;

    return api.get<DesignsResponse>('designs/get-designs', queryParams);
  },

  /**
   * Get a single design by ID
   */
  async getDesign(id: number): Promise<Design> {
    const response = await api.get<{ design: Design }>('designs/get-design', {
      id: id.toString(),
    });
    return response.design;
  },

  /**
   * Create a new design draft
   */
  async createDraft(
    data: CreateDesignRequest,
    authHeaders: HeadersInit
  ): Promise<Design> {
    const response = await api.post<{ design: Design }>(
      'designs/create-draft',
      data,
      authHeaders
    );
    return response.design;
  },

  /**
   * Update an existing design
   */
  async updateDesign(
    data: UpdateDesignRequest,
    authHeaders: HeadersInit
  ): Promise<Design> {
    const response = await api.put<{ design: Design }>(
      'designs/update-design',
      data,
      authHeaders
    );
    return response.design;
  },

  /**
   * Upload CAD and preview files to IPFS
   */
  async uploadFiles(
    cadFile: File,
    previewFile: File,
    authHeaders: HeadersInit
  ): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('cadFile', cadFile);
    formData.append('previewFile', previewFile);

    return api.upload<FileUploadResponse>(
      'designs/upload-files',
      formData,
      authHeaders
    );
  },

  /**
   * Generate NFT metadata and upload to IPFS
   */
  async generateMetadata(
    data: GenerateMetadataRequest,
    authHeaders: HeadersInit
  ): Promise<MetadataResponse> {
    return api.post<MetadataResponse>(
      'designs/generate-metadata',
      data,
      authHeaders
    );
  },
};
