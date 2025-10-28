import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const active = searchParams.get('active')
    const withProducts = searchParams.get('withProducts') === 'true'

    let query = supabase
      .from('categories')
      .select(withProducts ? `
        *,
        products (
          id,
          name_ar,
          name_en,
          status,
          active
        )
      ` : '*')

    // Apply filters
    if (active !== null) {
      query = query.eq('is_active', active === 'true')
    }

    // Apply sorting
    query = query
      .order('display_order', { ascending: true })
      .order('name_ar', { ascending: true })

    const { data: categories, error } = await query

    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }

    return NextResponse.json({ categories })

  } catch (error) {
    console.error('Error in categories GET:', error)
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
      color = '#3B82F6',
      display_order = 0,
      is_active = true
    } = body

    // Validate required fields
    if (!name_ar) {
      return NextResponse.json(
        { error: 'Name (Arabic) is required' },
        { status: 400 }
      )
    }

    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        name_ar,
        name_en,
        description_ar,
        description_en,
        color,
        display_order,
        is_active
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
      return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
    }

    return NextResponse.json({ category, message: 'Category created successfully' })

  } catch (error) {
    console.error('Error in categories POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}