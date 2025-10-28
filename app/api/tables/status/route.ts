import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// PUT - Update table status
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { tableId, status, is_available } = body

    if (!tableId) {
      return NextResponse.json({ error: 'Table ID is required' }, { status: 400 })
    }

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    // Validate status values
    const validStatuses = ['available', 'occupied', 'reserved', 'maintenance']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      }, { status: 400 })
    }

    // Update table status
    const { data: updatedTable, error } = await supabase
      .from('tables')
      .update({
        status,
        is_available: is_available !== undefined ? is_available : (status === 'available'),
        updated_at: new Date().toISOString()
      })
      .eq('id', tableId)
      .select()
      .single()

    if (error) {
      console.error('Error updating table status:', error)
      return NextResponse.json({ error: 'Failed to update table status' }, { status: 500 })
    }

    return NextResponse.json(updatedTable, { status: 200 })
  } catch (error) {
    console.error('Error in table status API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Get table status dashboard
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: tableStatus, error } = await supabase
      .from('table_dashboard')
      .select('*')
      .order('table_number')

    if (error) {
      console.error('Error fetching table status:', error)
      return NextResponse.json({ error: 'Failed to fetch table status' }, { status: 500 })
    }

    return NextResponse.json(tableStatus || [], { status: 200 })
  } catch (error) {
    console.error('Error in table status GET API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}