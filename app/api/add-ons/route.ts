import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const active = searchParams.get('active')
    
    const offset = (page - 1) * limit

    let query = supabase
      .from('add_ons')
      .select('*')

    // Apply filters
    if (search) {
      query = query.or(`name_ar.ilike.%${search}%,name_en.ilike.%${search}%`)
    }
    
    if (active !== null) {
      query = query.eq('is_active', active === 'true')
    }

    // Apply sorting and pagination
    query = query
      .order('display_order', { ascending: true })
      .order('name_ar', { ascending: true })
      .range(offset, offset + limit - 1)

    const { data: addOns, error, count } = await query

    if (error) {
      console.error('Error fetching add-ons:', error)
      return NextResponse.json({ error: 'Failed to fetch add-ons' }, { status: 500 })
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('add_ons')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      addOns,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Error in add-ons GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      name_ar,
      name_en,
      description_ar,
      description_en,
      price,
      is_active = true,
      display_order = 0
    } = body

    // Validate required fields
    if (!name_ar || price === undefined) {
      return NextResponse.json(
        { error: 'Name (Arabic) and price are required' },
        { status: 400 }
      )
    }

    const { data: addOn, error } = await supabase
      .from('add_ons')
      .insert({
        name_ar,
        name_en,
        description_ar,
        description_en,
        price,
        is_active,
        display_order
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating add-on:', error)
      return NextResponse.json({ error: 'Failed to create add-on' }, { status: 500 })
    }

    return NextResponse.json({ addOn, message: 'Add-on created successfully' })

  } catch (error) {
    console.error('Error in add-ons POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}