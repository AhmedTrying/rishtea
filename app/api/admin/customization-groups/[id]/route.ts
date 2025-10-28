import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      .eq('id', params.id)
      .single()

    const { data: group, error } = await query

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Customization group not found' }, { status: 404 })
      }
      console.error('Error fetching customization group:', error)
      return NextResponse.json({ error: 'Failed to fetch customization group' }, { status: 500 })
    }

    return NextResponse.json(group)
  } catch (error) {
    console.error('Error in customization group API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      .update({
        name_ar,
        name_en: name_en || null,
        description_ar: description_ar || null,
        description_en: description_en || null,
        type,
        is_required: is_required || false,
        display_order: display_order || 0,
        is_active: is_active !== false,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Customization group not found' }, { status: 404 })
      }
      console.error('Error updating customization group:', error)
      return NextResponse.json({ error: 'Failed to update customization group' }, { status: 500 })
    }

    return NextResponse.json(group)
  } catch (error) {
    console.error('Error in customization group API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // First, delete all associated options
    const { error: optionsError } = await supabase
      .from('customization_options')
      .delete()
      .eq('group_id', params.id)

    if (optionsError) {
      console.error('Error deleting customization options:', optionsError)
      return NextResponse.json({ error: 'Failed to delete associated options' }, { status: 500 })
    }

    // Then delete the group
    const { error } = await supabase
      .from('customization_groups')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting customization group:', error)
      return NextResponse.json({ error: 'Failed to delete customization group' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Customization group deleted successfully' })
  } catch (error) {
    console.error('Error in customization group API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}