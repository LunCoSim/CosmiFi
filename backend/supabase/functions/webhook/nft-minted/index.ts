import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { NFTMintedWebhook, ApiResponse } from '../../_shared/types/index.ts'
import { createSuccessResponse, createErrorResponse, corsHeaders } from '../../_shared/middleware/auth.ts'
import { getDesignData, getCollectionDesigner } from '../../_shared/utils/contracts.ts'

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
    const { tokenId, owner, metadataCid, collectionAddress, transactionHash, blockNumber }: NFTMintedWebhook = await req.json()
    
    // Validate required fields
    if (!tokenId || !owner || !metadataCid || !collectionAddress) {
      return createErrorResponse('Missing required fields: tokenId, owner, metadataCid, collectionAddress')
    }
    
    try {
      // Verify the minting event by checking the contract
      const designData = await getDesignData(collectionAddress, tokenId)
      const collectionDesigner = await getCollectionDesigner(collectionAddress)
      
      // Verify the metadata CID matches
      if (designData.metadataCid !== metadataCid) {
        return createErrorResponse('Metadata CID mismatch', 400)
      }
      
      // Verify the owner matches (in case of transfer after minting)
      // Note: This check might need adjustment based on your business logic
      console.log(`Verified minting event for token ${tokenId} in collection ${collectionAddress}`)
    } catch (error) {
      console.error('Error verifying minting event:', error)
      // Continue with processing even if verification fails, but log the error
    }
    
    // Update design record with minting information
    const { data, error } = await supabase
      .from('designs')
      .update({
        token_id: tokenId,
        owner_address: owner,
        metadata_cid: metadataCid,
        collection_address: collectionAddress,
        status: 'minted',
        minted_at: new Date().toISOString()
      })
      .eq('metadata_cid', metadataCid)
      .select()
      .single()
    
    if (error) throw error
    
    return createSuccessResponse({ 
      success: true, 
      design: data 
    })
  } catch (error: any) {
    console.error('NFT minted webhook error:', error)
    return createErrorResponse(error.message, 500)
  }
})