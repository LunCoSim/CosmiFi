import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { generateJWT } from '../_shared/utils/jwt.ts'
import { verifyEthSignature } from '../_shared/utils/contracts.ts'
import { WalletVerificationRequest, WalletVerificationResponse, ApiResponse } from '../_shared/types/index.ts'
import { createSuccessResponse, createErrorResponse, corsHeaders } from '../_shared/middleware/auth.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  if (req.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405)
  }
  
  try {
    const { walletAddress, signature, message }: WalletVerificationRequest = await req.json()
    
    // Basic validation
    if (!walletAddress || !signature || !message) {
      return createErrorResponse('Missing required fields: walletAddress, signature, message')
    }
    
    // Verify Ethereum signature using wagmi/viem
    const isValidSignature = await verifyEthSignature(message, signature, walletAddress)
    
    if (!isValidSignature) {
      return createErrorResponse('Invalid signature', 401)
    }
    
    // Check if user exists in profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error
    }
    
    // Generate JWT
    const token = await generateJWT({ wallet_address: walletAddress })
    
    const response: WalletVerificationResponse = {
      token,
      profile: profile,
      isNewUser: !profile
    }
    
    return createSuccessResponse(response)
  } catch (error: any) {
    console.error('Wallet verification error:', error)
    return createErrorResponse(error.message, 500)
  }
})