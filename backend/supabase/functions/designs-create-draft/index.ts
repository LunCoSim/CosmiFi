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

  if (req.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405)
  }

  try {
    const { 
      name, 
      description, 
      category, 
      tags, 
      version, 
      license, 
      previewCid, 
      cadZipCid 
    } = await req.json()
    
    const authenticatedReq = req as AuthenticatedRequest
    const walletAddress = authenticatedReq.user.user_metadata.wallet_address

    // Validate required fields
    if (!name || !description || !category || !previewCid || !cadZipCid) {
      return createErrorResponse('Missing required fields: name, description, category, previewCid, cadZipCid')
    }

    // Create design draft
    const { data: design, error } = await supabase
      .from('designs')
      .insert({
        name,
        description,
        category,
        tags: tags || [],
        version: version || 'v1.0',
        license: license || 'CC-BY-4.0',
        preview_cid: previewCid,
        cad_zip_cid: cadZipCid,
        owner_address: walletAddress,
        status: 'uploaded'
      })
      .select()
      .single()

    if (error) throw error

    return createSuccessResponse({ design })
  } catch (error: any) {
    console.error('Create draft error:', error)
    return createErrorResponse(error.message, 500)
  }
})
