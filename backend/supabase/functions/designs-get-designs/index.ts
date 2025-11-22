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
    const owner = url.searchParams.get('owner')
    const status = url.searchParams.get('status')
    const category = url.searchParams.get('category')
    const search = url.searchParams.get('search')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const sortBy = url.searchParams.get('sort_by') || 'created_at'
    const sortOrder = url.searchParams.get('sort_order') || 'desc'

    // Validate limit
    if (limit > 100) {
      return createErrorResponse('Limit cannot exceed 100')
    }

    let query = supabase
      .from('designs')
      .select('*', { count: 'exact' })

    // Apply filters
    if (owner) query = query.eq('owner_address', owner)
    if (status) query = query.eq('status', status)
    if (category) query = query.eq('category', category)
    
    // Apply search if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply sorting
    const ascending = sortOrder === 'asc'
    query = query.order(sortBy, { ascending })

    // Apply pagination
    const { data: designs, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) throw error

    return createSuccessResponse({
      items: designs || [],
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit
    })
  } catch (error: any) {
    console.error('Get designs error:', error)
    return createErrorResponse(error.message, 500)
  }
})
