import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const includeOptions = searchParams.get('include_options') === 'true'

    let query = supabase
      .from('customization_groups')
      .select(includeOptions ? `
        *,
        customization_options (*)
      ` : '*')
      .order('display_order', { ascending: true })

    const { data: groups, error } = await query

    if (error) {
      console.error('Error fetching customization groups:', error)
      return NextResponse.json({ error: 'Failed to fetch customization groups' }, { status: 500 })
    }

    return NextResponse.json(groups || [])
  } catch (error) {
    console.error('Error in customization groups API:', error)
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
      type,
      is_required,
      display_order,
      is_active
    } = body

    // Validate required fields
    if (!name_ar || !type) {
      return NextResponse.json(
        { error: 'Name (Arabic) and type are required' },
        { status: 400 }
      )
    }

    // Validate type
    if (!['single_choice', 'multiple_choice', 'quantity'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be single_choice, multiple_choice, or quantity' },
        { status: 400 }
      )
    }

    const { data: group, error } = await supabase
      .from('customization_groups')
      .insert({
        name_ar,
        name_en: name_en || null,
        description_ar: description_ar || null,
        description_en: description_en || null,
        type,
        is_required: is_required || false,
        display_order: display_order || 0,
        is_active: is_active !== false
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating customization group:', error)
      return NextResponse.json({ error: 'Failed to create customization group' }, { status: 500 })
    }

    return NextResponse.json(group, { status: 201 })
  } catch (error) {
    console.error('Error in customization groups API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}