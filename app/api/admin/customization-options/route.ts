import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('group_id')

    let query = supabase
      .from('customization_options')
      .select('*')
      .order('display_order', { ascending: true })

    if (groupId) {
      query = query.eq('group_id', groupId)
    }

    const { data: options, error } = await query

    if (error) {
      console.error('Error fetching customization options:', error)
      return NextResponse.json({ error: 'Failed to fetch customization options' }, { status: 500 })
    }

    return NextResponse.json(options || [])
  } catch (error) {
    console.error('Error in customization options API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const {
      group_id,
      name_ar,
      name_en,
      description_ar,
      description_en,
      price_modifier,
      icon,
      display_order,
      is_active
    } = body

    // Validate required fields
    if (!group_id || !name_ar) {
      return NextResponse.json(
        { error: 'Group ID and name (Arabic) are required' },
        { status: 400 }
      )
    }

    // Verify that the group exists
    const { data: group, error: groupError } = await supabase
      .from('customization_groups')
      .select('id')
      .eq('id', group_id)
      .single()

    if (groupError || !group) {
      return NextResponse.json(
        { error: 'Invalid group ID' },
        { status: 400 }
      )
    }

    const { data: option, error } = await supabase
      .from('customization_options')
      .insert({
        group_id,
        name_ar,
        name_en: name_en || null,
        description_ar: description_ar || null,
        description_en: description_en || null,
        price_modifier: price_modifier || 0,
        icon: icon || null,
        display_order: display_order || 0,
        is_active: is_active !== false
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating customization option:', error)
      return NextResponse.json({ error: 'Failed to create customization option' }, { status: 500 })
    }

    return NextResponse.json(option, { status: 201 })
  } catch (error) {
    console.error('Error in customization options API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}