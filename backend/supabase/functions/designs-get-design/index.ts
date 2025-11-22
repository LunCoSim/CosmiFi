import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { corsHeaders, createSuccessResponse, createErrorResponse } from '../_shared/middleware/auth.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  if (req.method !== 'GET') {
    return createErrorResponse('Method not allowed', 405)
  }

  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    const tokenId = url.searchParams.get('token_id')

    if (!id && !tokenId) {
      return createErrorResponse('Either id or token_id parameter required')
    }

    let query = supabase.from('designs').select('*')

    if (id) {
      query = query.eq('id', parseInt(id))
    } else if (tokenId) {
      query = query.eq('token_id', parseInt(tokenId))
    }

    const { data: design, error } = await query.single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    if (!design) {
      return createErrorResponse('Design not found', 404)
    }

    return createSuccessResponse({ design })
  } catch (error: any) {
    console.error('Get design error:', error)
    return createErrorResponse(error.message, 500)
  }
})
