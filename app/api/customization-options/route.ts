import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { optionIds } = await request.json()
    
    console.log('Received optionIds:', optionIds)
    
    if (!optionIds || !Array.isArray(optionIds)) {
      return NextResponse.json({ error: 'Invalid option IDs' }, { status: 400 })
    }

    const supabase = await createClient()
    const allOptions = []
    
    // Separate regular option IDs from add-on IDs
    const regularOptionIds = optionIds.filter(id => id !== 'add-ons' && !id.startsWith('addon-'))
    const addOnIds = optionIds.filter(id => id.startsWith('addon-')).map(id => id.replace('addon-', ''))
    
    console.log('Regular option IDs:', regularOptionIds)
    console.log('Add-on IDs:', addOnIds)
    
    // Fetch regular customization options from both old and new systems
    if (regularOptionIds.length > 0) {
      console.log('Querying both customization systems for IDs:', regularOptionIds)
      
      // 1. Try old system: customization_options table
      const { data: oldSystemOptions, error: oldSystemError } = await supabase
        .from('customization_options')
        .select(`
          id,
          name_ar,
          name_en,
          group_id,
          customization_groups!inner(
            id,
            name_ar,
            name_en
          )
        `)
        .in('id', regularOptionIds)
        .eq('is_active', true)

      console.log('Old system query result - error:', oldSystemError, 'data:', oldSystemOptions)
      
      if (oldSystemOptions && oldSystemOptions.length > 0) {
        // Transform the data to include group names
        const transformedOldOptions = oldSystemOptions.map(option => ({
          id: option.id,
          name_ar: option.name_ar,
          name_en: option.name_en,
          group_name_ar: option.customization_groups.name_ar,
          group_name_en: option.customization_groups.name_en
        }))
        
        console.log('Transformed old system options:', transformedOldOptions)
        allOptions.push(...transformedOldOptions)
      }
      
      // 2. Try new system: product_option_values table for remaining IDs
      const foundOldIds = oldSystemOptions?.map(opt => opt.id) || []
      const remainingIds = regularOptionIds.filter(id => !foundOldIds.includes(id))
      
      if (remainingIds.length > 0) {
        console.log('Querying new system (product_option_values) for remaining IDs:', remainingIds)
        
        const { data: newSystemOptions, error: newSystemError } = await supabase
          .from('product_option_values')
          .select(`
            id,
            value_ar,
            value_en,
            option_id,
            product_options!inner(
              id,
              name_ar,
              name_en
            )
          `)
          .in('id', remainingIds)
          .eq('is_active', true)

        console.log('New system query result - error:', newSystemError, 'data:', newSystemOptions)
        
        if (newSystemOptions && newSystemOptions.length > 0) {
          // Transform the data to match expected format
          const transformedNewOptions = newSystemOptions.map(option => ({
            id: option.id,
            name_ar: option.value_ar,
            name_en: option.value_en,
            group_name_ar: option.product_options.name_ar,
            group_name_en: option.product_options.name_en
          }))
          
          console.log('Transformed new system options:', transformedNewOptions)
          allOptions.push(...transformedNewOptions)
        }
      }
    }
    
    // Fetch add-ons
    if (addOnIds.length > 0) {
      const { data: addOns, error: addOnsError } = await supabase
        .from('add_ons')
        .select('id, name_ar, name_en')
        .in('id', addOnIds)
        .eq('is_active', true)

      if (addOnsError) {
        console.error('Error fetching add-ons:', addOnsError)
      } else {
        // Transform add-ons to match the expected format
        const transformedAddOns = addOns?.map(addOn => ({
          id: `addon-${addOn.id}`, // Keep the addon- prefix for consistency
          name_ar: addOn.name_ar,
          name_en: addOn.name_en,
          group_name_ar: 'إضافات',
          group_name_en: 'Add-ons'
        })) || []
        
        allOptions.push(...transformedAddOns)
      }
    }

    console.log('Final response:', allOptions)
    return NextResponse.json(allOptions)
  } catch (error) {
    console.error('Error in customization-options API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}