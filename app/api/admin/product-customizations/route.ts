import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('product_id')
    const groupId = searchParams.get('group_id')

    let query = supabase
      .from('product_customization_groups')
      .select(`
        *,
        products!inner(id, name_ar, name_en),
        customization_groups!inner(id, name_ar, name_en, type, is_required)
      `)

    if (productId) {
      query = query.eq('product_id', productId)
    }

    if (groupId) {
      query = query.eq('group_id', groupId)
    }

    const { data: associations, error } = await query

    if (error) {
      console.error('Error fetching product customizations:', error)
      return NextResponse.json({ error: 'Failed to fetch product customizations' }, { status: 500 })
    }

    return NextResponse.json(associations || [])
  } catch (error) {
    console.error('Error in product customizations API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { product_id, group_id } = body

    // Validate required fields
    if (!product_id || !group_id) {
      return NextResponse.json(
        { error: 'Product ID and Group ID are required' },
        { status: 400 }
      )
    }

    // Verify that the product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', product_id)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
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

    // Check if association already exists
    const { data: existing, error: existingError } = await supabase
      .from('product_customization_groups')
      .select('id')
      .eq('product_id', product_id)
      .eq('group_id', group_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Association already exists' },
        { status: 409 }
      )
    }

    const { data: association, error } = await supabase
      .from('product_customization_groups')
      .insert({
        product_id,
        group_id
      })
      .select(`
        *,
        products!inner(id, name_ar, name_en),
        customization_groups!inner(id, name_ar, name_en, type, is_required)
      `)
      .single()

    if (error) {
      console.error('Error creating product customization:', error)
      return NextResponse.json({ error: 'Failed to create product customization' }, { status: 500 })
    }

    return NextResponse.json(association, { status: 201 })
  } catch (error) {
    console.error('Error in product customizations API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('product_id')
    const groupId = searchParams.get('group_id')

    if (!productId || !groupId) {
      return NextResponse.json(
        { error: 'Product ID and Group ID are required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('product_customization_groups')
      .delete()
      .eq('product_id', productId)
      .eq('group_id', groupId)

    if (error) {
      console.error('Error deleting product customization:', error)
      return NextResponse.json({ error: 'Failed to delete product customization' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Product customization deleted successfully' })
  } catch (error) {
    console.error('Error in product customizations API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}