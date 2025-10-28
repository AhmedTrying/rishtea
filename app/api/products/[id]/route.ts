import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name_ar,
          name_en,
          color
        ),
        product_images (
          id,
          image_url,
          alt_text,
          is_main,
          display_order
        ),
        product_sizes (
          id,
          name_ar,
          name_en,
          price,
          display_order,
          is_active
        ),
        product_add_ons (
          id,
          add_on_id,
          is_active,
          display_order,
          add_ons (
            id,
            name_ar,
            name_en,
            description_ar,
            description_en,
            price
          )
        ),
        product_options (
          id,
          name_ar,
          name_en,
          type,
          is_required,
          display_order,
          is_active,
          product_option_values (
            id,
            value_ar,
            value_en,
            extra_price,
            display_order,
            is_active
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching product:', error)
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product })

  } catch (error) {
    console.error('Error in product GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const body = await request.json()

    const {
      name_ar,
      name_en,
      category_id,
      short_description_ar,
      short_description_en,
      full_description_ar,
      full_description_en,
      sku,
      status,
      priority_order,
      is_seasonal,
      allow_customer_notes,
      calories,
      allergens,
      tags,
      base_price,
      is_market_price,
      sizes = [],
      images = [],
      add_ons = [],
      options = []
    } = body

    // Update the main product
    const { data: product, error: productError } = await supabase
      .from('products')
      .update({
        name_ar,
        name_en,
        category_id,
        short_description_ar,
        short_description_en,
        full_description_ar,
        full_description_en,
        sku,
        status,
        priority_order,
        is_seasonal,
        allow_customer_notes,
        calories,
        allergens,
        tags,
        base_price,
        is_market_price,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (productError) {
      console.error('Error updating product:', productError)
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
    }

    // Update product images
    // First, delete existing images
    await supabase.from('product_images').delete().eq('product_id', id)
    
    // Insert new images
    if (images && images.length > 0) {
      const imageInserts = images.map((img: any, index: number) => ({
        product_id: id,
        image_url: img.image_url,
        alt_text: img.alt_text || '',
        is_main: img.is_main || index === 0,
        display_order: img.display_order || index
      }))

      await supabase.from('product_images').insert(imageInserts)
    }

    // Update product sizes
    await supabase.from('product_sizes').delete().eq('product_id', id)
    
    if (sizes && sizes.length > 0) {
      const sizeInserts = sizes.map((size: any, index: number) => ({
        product_id: id,
        name_ar: size.name_ar,
        name_en: size.name_en,
        price: size.price,
        display_order: size.display_order || index,
        is_active: size.is_active !== false
      }))

      await supabase.from('product_sizes').insert(sizeInserts)
    }

    // Update product add-ons
    await supabase.from('product_add_ons').delete().eq('product_id', id)
    
    if (add_ons && add_ons.length > 0) {
      const addOnInserts = add_ons.map((addOn: any, index: number) => ({
        product_id: id,
        add_on_id: addOn.add_on_id,
        is_active: addOn.is_active !== false,
        display_order: addOn.display_order || index
      }))

      await supabase.from('product_add_ons').insert(addOnInserts)
    }

    // Update product options and their values
    // First, get existing options to delete their values
    const { data: existingOptions } = await supabase
      .from('product_options')
      .select('id')
      .eq('product_id', id)

    if (existingOptions) {
      for (const option of existingOptions) {
        await supabase.from('product_option_values').delete().eq('option_id', option.id)
      }
    }

    // Delete existing options
    await supabase.from('product_options').delete().eq('product_id', id)

    // Insert new options and their values
    if (options && options.length > 0) {
      for (const option of options) {
        const { data: insertedOption, error: optionError } = await supabase
          .from('product_options')
          .insert({
            product_id: id,
            name_ar: option.name_ar,
            name_en: option.name_en,
            type: option.type,
            is_required: option.is_required || false,
            display_order: option.display_order || 0,
            is_active: option.is_active !== false
          })
          .select()
          .single()

        if (optionError) {
          console.error('Error inserting product option:', optionError)
          continue
        }

        // Insert option values
        if (option.values && option.values.length > 0) {
          const valueInserts = option.values.map((value: any, index: number) => ({
            option_id: insertedOption.id,
            value_ar: value.value_ar,
            value_en: value.value_en,
            extra_price: value.extra_price || 0,
            display_order: value.display_order || index,
            is_active: value.is_active !== false
          }))

          await supabase.from('product_option_values').insert(valueInserts)
        }
      }
    }

    return NextResponse.json({ product, message: 'Product updated successfully' })

  } catch (error) {
    console.error('Error in product PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Check if product exists
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Delete the product (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting product:', deleteError)
      return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Product deleted successfully' })

  } catch (error) {
    console.error('Error in product DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}