import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { id } = params

    const { data: addOn, error } = await supabase
      .from('add_ons')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching add-on:', error)
      return NextResponse.json({ error: 'Add-on not found' }, { status: 404 })
    }

    return NextResponse.json({ addOn })

  } catch (error) {
    console.error('Error in add-on GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { id } = params
    const body = await request.json()

    const {
      name_ar,
      name_en,
      description_ar,
      description_en,
      price,
      is_active,
      display_order
    } = body

    const { data: addOn, error } = await supabase
      .from('add_ons')
      .update({
        name_ar,
        name_en,
        description_ar,
        description_en,
        price,
        is_active,
        display_order,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating add-on:', error)
      return NextResponse.json({ error: 'Failed to update add-on' }, { status: 500 })
    }

    return NextResponse.json({ addOn, message: 'Add-on updated successfully' })

  } catch (error) {
    console.error('Error in add-on PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { id } = params

    // Check if add-on is being used by any products
    const { data: productAddOns, error: checkError } = await supabase
      .from('product_add_ons')
      .select('id')
      .eq('add_on_id', id)
      .limit(1)

    if (checkError) {
      console.error('Error checking add-on usage:', checkError)
      return NextResponse.json({ error: 'Failed to check add-on usage' }, { status: 500 })
    }

    if (productAddOns && productAddOns.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete add-on that is being used by products' },
        { status: 400 }
      )
    }

    const { error: deleteError } = await supabase
      .from('add_ons')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting add-on:', deleteError)
      return NextResponse.json({ error: 'Failed to delete add-on' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Add-on deleted successfully' })

  } catch (error) {
    console.error('Error in add-on DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}