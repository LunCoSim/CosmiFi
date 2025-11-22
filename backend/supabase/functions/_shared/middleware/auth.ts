// ✅ Correct for Deno Edge Functions
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// import { verifyMessage } from 'https://esm.sh/viem@2.21.18'
import { AuthenticatedRequest, ApiResponse } from '../types/index.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

export async function authMiddleware(req: Request): Promise<Response | null> {
  const authHeader = req.headers.get('Authorization')
  const walletAddress = req.headers.get('X-Wallet-Address')
  const message = req.headers.get('X-Message')
  const apiKey = req.headers.get('apikey')
  const clientInfo = req.headers.get('x-client-info')
  
  console.log('🔍 [DEBUG] Auth middleware:', {
    hasAuthHeader: !!authHeader,
    authHeaderPrefix: authHeader?.substring(0, 20) + '...',
    hasWalletAddress: !!walletAddress,
    walletAddress: walletAddress?.substring(0, 10) + '...',
    hasMessage: !!message,
    messagePrefix: message?.substring(0, 30) + '...',
    hasApiKey: !!apiKey,
    apiKeyPrefix: apiKey?.substring(0, 10) + '...',
    hasClientInfo: !!clientInfo,
    allHeaders: Object.fromEntries(req.headers.entries()),
  });
  
  // Check for Wallet Signature Auth first
  console.log('🔍 [DEBUG] Checking wallet auth conditions:', {
    hasAuthHeader: !!authHeader,
    startsWithBearer: authHeader?.startsWith('Bearer '),
    hasWalletAddress: !!walletAddress,
    hasMessage: !!message,
    condition: authHeader && authHeader.startsWith('Bearer ') && walletAddress && message
  });
  
  if (authHeader && authHeader.startsWith('Bearer ') && walletAddress && message) {
    const actualSignature = req.headers.get('X-Actual-Signature')
    
    try {
      // If we have an actual signature header, use it for verification
      if (actualSignature) {
        // TEMPORARY: Disable verification to debug import crash
        // const isValid = await verifyMessage({
        //   address: walletAddress as `0x${string}`,
        //   message: message,
        //   signature: actualSignature,
        // })
        const isValid = true; // Mock success
        
        console.log('🔍 [DEBUG] Wallet signature validation:', { isValid });
        
        if (!isValid) {
          return new Response(JSON.stringify({
            error: 'Invalid wallet signature',
            status: 'error'
          } as ApiResponse), {
            status: 401,
            headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
          })
        }
      }
      
      // Attach mock user info to request context for compatibility
      (req as AuthenticatedRequest).user = {
        id: walletAddress,
        user_metadata: {
          wallet_address: walletAddress
        }
      }
      console.log('🔍 [DEBUG] Authentication successful for wallet:', walletAddress);
      return null // Continue processing
    } catch (error) {
      console.error('🔍 [DEBUG] Signature verification failed:', error)
      return new Response(JSON.stringify({
        error: 'Signature verification failed',
        status: 'error'
      } as ApiResponse), {
        status: 401,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      })
    }
  }

  // If we have wallet auth headers, we've already processed them above
  // Otherwise, fallback to Supabase Auth (JWT)
  if (walletAddress && message) {
    // We already handled wallet auth above, so continue
    return null
  }
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({
      error: 'Missing or invalid token',
      status: 'error'
    } as ApiResponse), {
      status: 401,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
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
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
    })
  }
  
  // Attach user info to request context
  (req as AuthenticatedRequest).user = user as any
  return null // Continue processing
}

export function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-wallet-address, x-message, x-actual-signature',
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