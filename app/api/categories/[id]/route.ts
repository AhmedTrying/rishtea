import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { id } = params

    const { data: category, error } = await supabase
      .from('categories')
      .select(`
        *,
        products (
          id,
          name_ar,
          name_en,
          status,
          active,
          priority_order
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching category:', error)
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ category })

  } catch (error) {
    console.error('Error in category GET:', error)
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
      color,
      display_order,
      is_active
    } = body

    const { data: category, error } = await supabase
      .from('categories')
      .update({
        name_ar,
        name_en,
        description_ar,
        description_en,
        color,
        display_order,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating category:', error)
      return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
    }

    return NextResponse.json({ category, message: 'Category updated successfully' })

  } catch (error) {
    console.error('Error in category PUT:', error)
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

    // Check if category has products
    const { data: products, error: checkError } = await supabase
      .from('products')
      .select('id')
      .eq('category_id', id)
      .limit(1)

    if (checkError) {
      console.error('Error checking category usage:', checkError)
      return NextResponse.json({ error: 'Failed to check category usage' }, { status: 500 })
    }

    if (products && products.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category that has products. Please move or delete the products first.' },
        { status: 400 }
      )
    }

    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting category:', deleteError)
      return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Category deleted successfully' })

  } catch (error) {
    console.error('Error in category DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}