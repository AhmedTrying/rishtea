import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get('limit')) || 5

    // Fetch latest orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, created_at, items, total_amount, status, table_number')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching recent orders:', error)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    if (!orders) {
      return NextResponse.json([], { status: 200 })
    }

    // Collect all product ids from all orders
    const productIds = Array.from(new Set(
      orders.flatMap(order => (order.items || []).map((item: any) => item.id))
    ))

    // Fetch product images
    let productImages: Record<string, string> = {}
    if (productIds.length > 0) {
      const { data: products, error: prodError } = await supabase
        .from('products')
        .select('id, image_url')
        .in('id', productIds)

      if (!prodError && products) {
        productImages = Object.fromEntries(products.map((p: any) => [p.id, p.image_url]))
      }
    }

    // Attach image_url to each item
    const result = orders.map(order => ({
      id: order.id,
      created_at: order.created_at,
      total_amount: order.total_amount,
      status: order.status,
      table_number: order.table_number,
      items: (order.items || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        image_url: productImages[item.id] || null
      }))
    }))

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Error in recent orders API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}