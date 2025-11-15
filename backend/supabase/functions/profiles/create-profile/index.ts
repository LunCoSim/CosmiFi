import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { authMiddleware, createSuccessResponse, createErrorResponse, corsHeaders } from '../../_shared/middleware/auth.ts'
import { isDesigner } from '../../_shared/utils/contracts.ts'
import { UserProfile, ApiResponse, AuthenticatedRequest } from '../../_shared/types/index.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

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
    const { username, bio, avatar_url, social_links } = await req.json()
    const authenticatedReq = req as AuthenticatedRequest
    const walletAddress = authenticatedReq.user.user_metadata.wallet_address
    
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('wallet_address')
      .eq('wallet_address', walletAddress)
      .single()
    
    if (existingProfile) {
      return createErrorResponse('Profile already exists for this wallet address')
    }
    
    // Check if wallet is registered as a designer
    const designerStatus = await isDesigner(walletAddress)
    
    // Create new profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        wallet_address: walletAddress,
        username,
        bio,
        avatar_url,
        social_links: social_links || {},
        is_designer: designerStatus
      })
      .select()
      .single()
    
    if (error) throw error
    
    return createSuccessResponse({ profile })
  } catch (error: any) {
    console.error('Create profile error:', error)
    return createErrorResponse(error.message, 500)
  }
})