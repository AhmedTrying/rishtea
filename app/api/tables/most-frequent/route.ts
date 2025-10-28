import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch all table_numbers from orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select('table_number')

    if (error) {
      console.error('Error fetching orders for table frequency:', error)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json(null, { status: 200 })
    }

    // Count occurrences of each table_number
    const tableCounts: Record<number, number> = {}
    orders.forEach((order: any) => {
      if (order.table_number != null) {
        tableCounts[order.table_number] = (tableCounts[order.table_number] || 0) + 1
      }
    })

    // Find the most frequent table_number
    let maxTable = null
    let maxCount = 0
    for (const [table, count] of Object.entries(tableCounts)) {
      if (count > maxCount) {
        maxTable = table
        maxCount = count
      }
    }

    if (maxTable === null) {
      return NextResponse.json(null, { status: 200 })
    }

    return NextResponse.json({ 
      table_number: Number(maxTable), 
      order_count: maxCount 
    }, { status: 200 })
  } catch (error) {
    console.error('Error in most frequent table API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}