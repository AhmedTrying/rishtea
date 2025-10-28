import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const customizationGroups = []

    // 1. Fetch product add-ons
    const { data: productAddOns, error: addOnsError } = await supabase
      .from('product_add_ons')
      .select(`
        add_ons!inner(
          id,
          name_ar,
          name_en,
          description_ar,
          description_en,
          price,
          display_order
        )
      `)
      .eq('product_id', id)
      .eq('is_active', true)
      .eq('add_ons.is_active', true)

    if (addOnsError) {
      console.error('Error fetching product add-ons:', addOnsError)
    }

    // Convert add-ons to customization group format
    if (productAddOns && productAddOns.length > 0) {
      const addOnsGroup = {
        id: 'add-ons',
        name_ar: 'إضافات',
        name_en: 'Add-ons',
        description_ar: 'إضافات اختيارية للمنتج',
        description_en: 'Optional add-ons for the product',
        type: 'multiple',
        is_required: false,
        display_order: 999, // Show add-ons last
        is_active: true,
        customization_options: productAddOns.map(item => ({
          id: item.add_ons.id,
          name_ar: item.add_ons.name_ar,
          name_en: item.add_ons.name_en,
          description_ar: item.add_ons.description_ar,
          description_en: item.add_ons.description_en,
          price_modifier: item.add_ons.price,
          icon: '➕',
          display_order: item.add_ons.display_order,
          is_active: true
        })).sort((a, b) => a.display_order - b.display_order)
      }
      customizationGroups.push(addOnsGroup)
    }

    // 2. Fetch product options with their values
    const { data: productOptions, error: optionsError } = await supabase
      .from('product_options')
      .select(`
        id,
        name_ar,
        name_en,
        type,
        is_required,
        display_order,
        product_option_values!inner(
          id,
          value_ar,
          value_en,
          extra_price,
          display_order,
          is_active
        )
      `)
      .eq('product_id', id)
      .eq('is_active', true)
      .eq('product_option_values.is_active', true)

    if (optionsError) {
      console.error('Error fetching product options:', optionsError)
    }

    // Convert product options to customization group format
    if (productOptions && productOptions.length > 0) {
      productOptions.forEach(option => {
        const group = {
          id: option.id,
          name_ar: option.name_ar,
          name_en: option.name_en,
          description_ar: '',
          description_en: '',
          type: option.type === 'single_choice' ? 'single' : 'multiple',
          is_required: option.is_required,
          display_order: option.display_order,
          is_active: true,
          customization_options: option.product_option_values.map(value => ({
            id: value.id,
            name_ar: value.value_ar,
            name_en: value.value_en,
            description_ar: '',
            description_en: '',
            price_modifier: value.extra_price,
            icon: '',
            display_order: value.display_order,
            is_active: value.is_active
          })).sort((a, b) => a.display_order - b.display_order)
        }
        customizationGroups.push(group)
      })
    }

    // Sort groups by display_order
    const sortedGroups = customizationGroups.sort((a, b) => a.display_order - b.display_order)

    return NextResponse.json(sortedGroups)
  } catch (error) {
    console.error('Error in product customizations API:', error)
    // Return empty array to avoid breaking client flow
    return NextResponse.json([], { status: 200 })
  }
}