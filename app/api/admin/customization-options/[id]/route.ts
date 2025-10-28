import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { data: option, error } = await supabase
      .from('customization_options')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Customization option not found' }, { status: 404 })
      }
      console.error('Error fetching customization option:', error)
      return NextResponse.json({ error: 'Failed to fetch customization option' }, { status: 500 })
    }

    return NextResponse.json(option)
  } catch (error) {
    console.error('Error in customization option API:', error)
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
      price_modifier,
      icon,
      display_order,
      is_active
    } = body

    // Validate required fields
    if (!name_ar) {
      return NextResponse.json(
        { error: 'Name (Arabic) is required' },
        { status: 400 }
      )
    }

    const { data: option, error } = await supabase
      .from('customization_options')
      .update({
        name_ar,
        name_en: name_en || null,
        description_ar: description_ar || null,
        description_en: description_en || null,
        price_modifier: price_modifier || 0,
        icon: icon || null,
        display_order: display_order || 0,
        is_active: is_active !== false,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Customization option not found' }, { status: 404 })
      }
      console.error('Error updating customization option:', error)
      return NextResponse.json({ error: 'Failed to update customization option' }, { status: 500 })
    }

    return NextResponse.json(option)
  } catch (error) {
    console.error('Error in customization option API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('customization_options')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting customization option:', error)
      return NextResponse.json({ error: 'Failed to delete customization option' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Customization option deleted successfully' })
  } catch (error) {
    console.error('Error in customization option API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}