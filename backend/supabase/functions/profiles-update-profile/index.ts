import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { authMiddleware, createSuccessResponse, createErrorResponse, corsHeaders } from '../_shared/middleware/auth.ts'
import { AuthenticatedRequest } from '../_shared/types/index.ts'

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

  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    return createErrorResponse('Method not allowed', 405)
  }

  try {
    const { username, bio, avatar_url, social_links, banner_url, website, email } = await req.json()
    const authenticatedReq = req as AuthenticatedRequest
    const walletAddress = authenticatedReq.user.user_metadata.wallet_address

    // Build update object with only provided fields
    const updateData: any = {}
    if (username !== undefined) updateData.username = username
    if (bio !== undefined) updateData.bio = bio
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url
    if (banner_url !== undefined) updateData.banner_url = banner_url
    if (website !== undefined) updateData.website = website
    if (email !== undefined) updateData.email = email
    if (social_links !== undefined) updateData.social_links = social_links

    const { data: profile, error } = await supabase
      .from('profiles')
      .upsert({ 
        wallet_address: walletAddress,
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return createSuccessResponse({ profile })
  } catch (error: any) {
    console.error('Update profile error:', error)
    return createErrorResponse(error.message, 500)
  }
})
