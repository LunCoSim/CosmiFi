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
    const { id, name, description, category, tags, version, license, status } = await req.json()
    const authenticatedReq = req as AuthenticatedRequest
    const walletAddress = authenticatedReq.user.user_metadata.wallet_address

    if (!id) {
      return createErrorResponse('Design id required')
    }

    // Verify ownership
    const { data: existingDesign, error: fetchError } = await supabase
      .from('designs')
      .select('owner_address, status')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    if (!existingDesign) {
      return createErrorResponse('Design not found', 404)
    }

    if (existingDesign.owner_address !== walletAddress) {
      return createErrorResponse('Unauthorized: You do not own this design', 403)
    }

    // Prevent updating minted designs
    if (existingDesign.status === 'minted') {
      return createErrorResponse('Cannot update minted designs', 400)
    }

    // Build update object
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (tags !== undefined) updateData.tags = tags
    if (version !== undefined) updateData.version = version
    if (license !== undefined) updateData.license = license
    if (status !== undefined) {
      // Validate status transitions
      const validStatuses = ['draft', 'uploaded', 'metadata_ready']
      if (!validStatuses.includes(status)) {
        return createErrorResponse('Invalid status. Must be draft, uploaded, or metadata_ready')
      }
      updateData.status = status
    }

    const { data: design, error } = await supabase
      .from('designs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return createSuccessResponse({ design })
  } catch (error: any) {
    console.error('Update design error:', error)
    return createErrorResponse(error.message, 500)
  }
})
