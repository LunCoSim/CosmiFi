// ✅ Correct for Deno Edge Functions
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { AuthenticatedRequest, ApiResponse } from '../types/index.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

export async function authMiddleware(req: Request): Promise<Response | null> {
  const authHeader = req.headers.get('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ 
      error: 'Missing or invalid token',
      status: 'error'
    } as ApiResponse), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  const token = authHeader.substring(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    return new Response(JSON.stringify({ 
      error: 'Invalid token',
      status: 'error'
    } as ApiResponse), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  // Attach user info to request context
  // Type assertion to handle the actual Supabase user structure
  (req as AuthenticatedRequest).user = user as any
  return null // Continue processing
}

export function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
  }
}

export function handleCORS(): Response {
  return new Response('ok', { headers: corsHeaders() })
}

export function createSuccessResponse<T>(data: T): Response {
  return new Response(JSON.stringify({
    data,
    status: 'success'
  } as ApiResponse<T>), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
  })
}

export function createErrorResponse(error: string, status: number = 400): Response {
  return new Response(JSON.stringify({
    error,
    status: 'error'
  } as ApiResponse), {
    status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
  })
}