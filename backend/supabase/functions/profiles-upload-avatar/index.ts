import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { authMiddleware, createSuccessResponse, createErrorResponse, corsHeaders } from '../_shared/middleware/auth.ts'
import { pinFileToIPFS, validateFile, createIPFSGatewayUrl } from '../_shared/utils/ipfs.ts'
import { AuthenticatedRequest } from '../_shared/types/index.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req: Request) => {
  console.log('🔍 [DEBUG] Upload avatar request:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
  });

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('🔍 [DEBUG] Handling CORS preflight request');
    return new Response('ok', { headers: corsHeaders() })
  }

  // Handle authentication
  console.log('🔍 [DEBUG] Checking authentication...');
  
  // Skip Supabase JWT verification for wallet signature auth
  // We handle authentication manually in authMiddleware
  const authError = await authMiddleware(req)
  if (authError) {
    console.log('🔍 [DEBUG] Authentication failed:', authError);
    return authError
  }
  console.log('🔍 [DEBUG] Authentication successful');

  if (req.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405)
  }

  try {
    console.log('🔍 [DEBUG] Parsing form data...');
    const formData = await req.formData()
    const avatarFile = formData.get('avatar') as File
    const type = formData.get('type') as string || 'avatar' // 'avatar' or 'banner'

    console.log('🔍 [DEBUG] Form data parsed:', {
      hasAvatar: !!avatarFile,
      avatarFileName: avatarFile?.name,
      avatarSize: avatarFile?.size,
      avatarType: avatarFile?.type,
      type,
    });

    if (!avatarFile) {
      console.log('🔍 [DEBUG] No avatar file provided');
      return createErrorResponse('Avatar/banner file required')
    }

    // Validate image
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/jpg']
    const maxSize = type === 'banner' ? 10 * 1024 * 1024 : 5 * 1024 * 1024 // 10MB for banner, 5MB for avatar
    
    try {
      validateFile(avatarFile, allowedTypes, maxSize)
    } catch (error: any) {
      return createErrorResponse(error.message)
    }

    // Upload to IPFS
    const result = await pinFileToIPFS(avatarFile, `${type}-${Date.now()}`)

    // Update profile
    const authenticatedReq = req as AuthenticatedRequest
    const walletAddress = authenticatedReq.user.user_metadata.wallet_address

    const updateField = type === 'banner' ? 'banner_url' : 'avatar_url'
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({ [updateField]: result.IpfsHash })
      .eq('wallet_address', walletAddress)
      .select()
      .maybeSingle()

    if (error) throw error

    return createSuccessResponse({
      cid: result.IpfsHash,
      url: createIPFSGatewayUrl(result.IpfsHash),
      size: result.PinSize,
      type,
      profile
    })
  } catch (error: any) {
    console.error('Avatar/banner upload error:', error)
    return createErrorResponse(error.message, 500)
  }
})
