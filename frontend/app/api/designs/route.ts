import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const designData = await request.json();
    
    // Validate required fields
    if (!designData.name || !designData.description || !designData.owner_address) {
      return NextResponse.json(
        { error: 'Missing required design fields' },
        { status: 400 }
      );
    }

    // For now, return a mock success response. In production, this would save to Supabase
    const mockDesignId = Math.floor(Math.random() * 1000000);
    
    // TODO: Implement actual Supabase save
    // const { data, error } = await supabase
    //   .from('designs')
    //   .insert({
    //     name: designData.name,
    //     description: designData.description,
    //     category: designData.category,
    //     tags: designData.tags,
    //     version: designData.version,
    //     license: designData.license,
    //     preview_cid: designData.preview_cid,
    //     cad_zip_cid: designData.cad_zip_cid,
    //     metadata_cid: designData.metadata_cid,
    //     owner_address: designData.owner_address,
    //     status: designData.status || 'draft',
    //     created_at: new Date().toISOString(),
    //   })
    //   .select()
    //   .single();
    
    // if (error) {
    //   console.error('Supabase error:', error);
    //   return NextResponse.json(
    //     { error: 'Failed to save design to database' },
    //     { status: 500 }
    //   );
    // }
    
    return NextResponse.json({ 
      id: mockDesignId,
      ...designData,
      created_at: new Date().toISOString(),
      status: 'saved'
    });
  } catch (error) {
    console.error('Design save error:', error);
    return NextResponse.json(
      { error: 'Failed to save design' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerAddress = searchParams.get('owner');
    
    // For now, return mock data. In production, this would query Supabase
    const mockDesigns = [
      {
        id: 1,
        name: 'Sample Design 1',
        description: 'A sample engineering design',
        category: 'Aerospace',
        tags: ['prototype', 'test'],
        version: 'v1.0',
        license: 'CC-BY-4.0',
        preview_cid: 'bafybeigdyrzt5sfp7udm7hn76en2fa6f5jgd6ffjzq6hpxyfj',
        cad_zip_cid: 'bafyreibj4sdp7h6q2d5m3x7f2n6w4y5jz6hpxyfj',
        metadata_cid: 'bafykreihj5sdp7h6q2d5m3x7f2n6w4y5jz6hpxyfj',
        owner_address: ownerAddress || '0x1234567890123456789012345678901234567890',
        status: 'minted',
        created_at: '2024-01-15T10:30:00Z',
        minted_at: '2024-01-15T11:00:00Z'
      }
    ];
    
    // TODO: Implement actual Supabase query
    // const { data, error } = await supabase
    //   .from('designs')
    //   .select('*')
    //   .eq('owner_address', ownerAddress)
    //   .order('created_at', { ascending: false });
    
    // if (error) {
    //   console.error('Supabase error:', error);
    //   return NextResponse.json(
    //     { error: 'Failed to fetch designs' },
    //     { status: 500 }
    //   );
    // }
    
    return NextResponse.json({ designs: mockDesigns });
  } catch (error) {
    console.error('Design fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch designs' },
      { status: 500 }
    );
  }
}