import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const threshold = Number(searchParams.get('threshold')) || 5

    const { data, error } = await supabase
      .from('products')
      .select('id, name_ar, name_en, stock_quantity, image_url')
      .lt('stock_quantity', threshold)
      .order('stock_quantity', { ascending: true })

    if (error) {
      console.error('Error fetching low stock products:', error)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    return NextResponse.json(data || [], { status: 200 })
  } catch (error) {
    console.error('Error in low stock API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}