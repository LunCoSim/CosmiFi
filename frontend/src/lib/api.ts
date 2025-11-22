import { supabase } from './supabase';

const SUPABASE_FUNCTIONS_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(
  'https://',
  'https://'
).replace('.supabase.co', '.supabase.co/functions/v1');

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Generic API client for Supabase Edge Functions
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || SUPABASE_FUNCTIONS_URL || '';
    console.log('ApiClient initialized with baseUrl:', this.baseUrl);
    if (!this.baseUrl) {
      console.warn('Warning: NEXT_PUBLIC_SUPABASE_URL is not set. API requests will fail or default to localhost.');
    }
  }

  /**
   * Make a request to a Supabase Edge Function
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Convert endpoint from profiles/upload-avatar to profiles-upload-avatar for Supabase Edge Functions
    const supabaseEndpoint = endpoint.replace(/\//g, '-');
    const url = `${this.baseUrl}/${supabaseEndpoint}`;

    // Add Supabase API key to headers
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const defaultHeaders: Record<string, string> = supabaseAnonKey ? { 'apikey': supabaseAnonKey } : {};

    try {
      // Create Headers object properly
      const requestHeaders = new Headers();
      
      // Add default headers
      if (defaultHeaders) {
        Object.entries(defaultHeaders).forEach(([key, value]) => {
          requestHeaders.set(key, value);
        });
      }
      
      // Add content type
      requestHeaders.set('Content-Type', 'application/json');
      
      // Add custom headers
      if (options.headers) {
        const headersObj = options.headers instanceof Headers ?
          Object.fromEntries(options.headers.entries()) :
          Array.isArray(options.headers) ? Object.fromEntries(options.headers) :
          options.headers;
        
        Object.entries(headersObj).forEach(([key, value]) => {
          if (value !== undefined) {
            requestHeaders.set(key, String(value));
          }
        });
      }
      
      const response = await fetch(url, {
        ...options,
        headers: requestHeaders,
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // If we get HTML instead of JSON, the endpoint likely doesn't exist
        if (contentType?.includes('text/html')) {
          throw new ApiError(
            `API endpoint not found: ${endpoint}. The backend may not be deployed or the endpoint doesn't exist.`,
            response.status || 404
          );
        }
        throw new ApiError(
          `Invalid response type: expected JSON, got ${contentType}`,
          response.status || 500
        );
      }

      const responseText = await response.text();
      console.log('🔍 [DEBUG] Raw response text:', responseText);
      
      let data: ApiResponse<T>;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('🔍 [DEBUG] JSON parse error:', parseError);
        throw new ApiError(
          'Invalid JSON response',
          response.status,
          { raw: responseText }
        );
      }

      console.log('🔍 [DEBUG] Parsed response:', data);

      // Check if response has the expected structure
      if (data && typeof data === 'object' && 'data' in data && 'status' in data) {
        if (!response.ok || data.status !== 'success') {
          throw new ApiError(
            data.error || 'Request failed',
            response.status,
            data
          );
        }
        
        console.log('🔍 [DEBUG] Returning data:', data.data);
        return data.data as T;
      } else {
        // Handle case where response is not in expected format
        console.error('🔍 [DEBUG] Unexpected response format:', data);
        throw new ApiError(
          'Unexpected response format',
          response.status,
          { raw: responseText }
        );
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error',
        500
      );
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string>, headers?: HeadersInit): Promise<T> {
    const queryString = params
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return this.request<T>(`${endpoint}${queryString}`, {
      method: 'GET',
      headers,
    });
  }
  /**
   * GET request without authentication (for public data)
   */
  async getPublic<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const queryString = params
      ? '?' + new URLSearchParams({ ...params, public: 'true' }).toString()
      : '?public=true';
    return this.request<T>(`${endpoint}${queryString}`, {
      method: 'GET',
      // Don't include auth headers for public requests
    });
  },


  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: any, headers?: HeadersInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      headers,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: any, headers?: HeadersInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: any, headers?: HeadersInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, headers?: HeadersInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers,
    });
  }

  /**
   * Upload files using FormData
   */
  async upload<T>(endpoint: string, formData: FormData, headers?: HeadersInit): Promise<T> {
    // Convert endpoint from profiles/upload-avatar to profiles-upload-avatar for Supabase Edge Functions
    const supabaseEndpoint = endpoint.replace(/\//g, '-');
    const url = `${this.baseUrl}/${supabaseEndpoint}`;

    // Add Supabase API key to headers
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const defaultHeaders = supabaseAnonKey ? { 'apikey': supabaseAnonKey } : {};

    // Convert HeadersInit to object for logging
    const headersObj = headers ?
      (headers instanceof Headers ? Object.fromEntries(headers.entries()) :
       Array.isArray(headers) ? Object.fromEntries(headers) : headers) : {};

    console.log('🔍 [DEBUG] Upload request START:', {
      url,
      endpoint,
      supabaseEndpoint,
      baseUrl: this.baseUrl,
      hasSupabaseAnonKey: !!supabaseAnonKey,
      supabaseAnonKeyPrefix: supabaseAnonKey?.substring(0, 10) + '...',
      headers: {
        ...defaultHeaders,
        ...headersObj,
        // Don't log sensitive auth headers fully
        Authorization: headersObj.Authorization ? '[REDACTED]' : undefined,
        'X-Wallet-Address': headersObj['X-Wallet-Address'],
        'X-Message': headersObj['X-Message'] ? '[REDACTED]' : undefined,
      },
      formDataKeys: Array.from(formData.keys()),
    });

    try {
      console.log('🔍 [DEBUG] Sending fetch request...');
      
      // Create Headers object properly
      const requestHeaders = new Headers();
      
      // Add default headers
      if (defaultHeaders) {
        Object.entries(defaultHeaders).forEach(([key, value]) => {
          requestHeaders.set(key, value);
        });
      }
      
      // Add custom headers
      if (headers) {
        const headersObj = headers instanceof Headers ?
          Object.fromEntries(headers.entries()) :
          Array.isArray(headers) ? Object.fromEntries(headers) :
          headers;
        
        Object.entries(headersObj).forEach(([key, value]) => {
          if (value !== undefined) {
            requestHeaders.set(key, String(value));
          }
        });
      }
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: requestHeaders,
      });

      console.log('🔍 [DEBUG] Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        ok: response.ok,
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      console.log('🔍 [DEBUG] Response content-type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        // If we get HTML instead of JSON, the endpoint likely doesn't exist
        if (contentType?.includes('text/html')) {
          console.error('🔍 [DEBUG] Received HTML response - endpoint may not exist');
          throw new ApiError(
            `API endpoint not found: ${endpoint}. The backend may not be deployed or the endpoint doesn't exist.`,
            response.status || 404
          );
        }
        throw new ApiError(
          `Invalid response type: expected JSON, got ${contentType}`,
          response.status || 500
        );
      }

      const data: ApiResponse<T> = await response.json();

      // Check both possible response formats
      const isSuccess = data.success || (data as any).status === 'success';

      if (!response.ok || !isSuccess) {
        throw new ApiError(
          data.error || 'Upload failed',
          response.status,
          data
        );
      }

      return data.data as T;
    } catch (error) {
      console.error('🔍 [DEBUG] Upload error:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Upload failed',
        500
      );
    }
  }
}

// Export singleton instance
export const api = new ApiClient();
