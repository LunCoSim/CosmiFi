import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { pinJSONToIPFS } from '../../_shared/utils/ipfs.ts'
import { authMiddleware, createSuccessResponse, createErrorResponse, corsHeaders } from '../../_shared/middleware/auth.ts'
import { MetadataRequest, MetadataResponse, NFTMetadata, ApiResponse, AuthenticatedRequest } from '../../_shared/types/index.ts'

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
    const data: MetadataRequest = await req.json()
    const authenticatedReq = req as AuthenticatedRequest
    const walletAddress = authenticatedReq.user.user_metadata.wallet_address
    
    // Generate metadata JSON
    const metadata: NFTMetadata = {
      name: data.name,
      description: data.description,
      image: `ipfs://${data.previewCid}`,
      cad_zip: `ipfs://${data.cadZipCid}`,
      creator: walletAddress,
      category: data.category,
      version: data.version,
      tags: data.tags,
      license: data.license,
      attributes: [
        { trait_type: "Component Type", value: data.category },
        { trait_type: "Format", value: "CAD" }
      ]
    }
    
    // Pin metadata to IPFS
    const result = await pinJSONToIPFS(metadata, `metadata-${Date.now()}`)
    
    const response: MetadataResponse = {
      metadataCid: result.IpfsHash,
      metadata
    }
    
    return createSuccessResponse(response)
  } catch (error: any) {
    console.error('Metadata generation error:', error)
    return createErrorResponse(error.message, 500)
  }
})