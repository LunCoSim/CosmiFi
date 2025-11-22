import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { pinFileToIPFS, validateFile } from '../_shared/utils/ipfs.ts'
import { authMiddleware, createSuccessResponse, createErrorResponse, corsHeaders } from '../_shared/middleware/auth.ts'
import { FileUploadResponse, ApiResponse } from '../_shared/types/index.ts'

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  // Handle authentication
  const authError = await authMiddleware(req)
  if (authError) return authError
  
  if (req.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405)
  }
  
  try {
    const formData = await req.formData()
    const cadFile = formData.get('cadFile') as File
    const previewFile = formData.get('previewFile') as File
    
    if (!cadFile || !previewFile) {
      return createErrorResponse('Both CAD and preview files required')
    }
    
    // Validate file types
    const allowedCadTypes = ['application/zip', 'application/x-zip-compressed']
    const allowedImageTypes = ['image/png', 'image/jpeg', 'image/webp']
    
    try {
      validateFile(cadFile, allowedCadTypes, 50 * 1024 * 1024) // 50MB
      validateFile(previewFile, allowedImageTypes, 50 * 1024 * 1024) // 50MB
    } catch (error: any) {
      return createErrorResponse(error.message)
    }
    
    // Upload files to IPFS
    const [cadResult, previewResult] = await Promise.all([
      pinFileToIPFS(cadFile, `cad-${Date.now()}`),
      pinFileToIPFS(previewFile, `preview-${Date.now()}`)
    ])
    
    const response: FileUploadResponse = {
      cadZipCid: cadResult.IpfsHash,
      previewCid: previewResult.IpfsHash,
      cadSize: cadResult.PinSize,
      previewSize: previewResult.PinSize
    }
    
    return createSuccessResponse(response)
  } catch (error: any) {
    console.error('File upload error:', error)
    return createErrorResponse(error.message, 500)
  }
})