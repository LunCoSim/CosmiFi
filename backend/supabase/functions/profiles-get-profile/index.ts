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
    const walletAddress = url.searchParams.get('wallet_address')

    if (!walletAddress) {
      return createErrorResponse('wallet_address parameter required')
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    if (!profile) {
      return createErrorResponse('Profile not found', 404)
    }

    return createSuccessResponse({ profile })
  } catch (error: any) {
    console.error('Get profile error:', error)
    return createErrorResponse(error.message, 500)
  }
})
