import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// GET - Fetch all tables
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: tables, error } = await supabase
      .from('tables')
      .select('*')
      .order('number')

    if (error) {
      console.error('Error fetching tables:', error)
      return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 })
    }

    return NextResponse.json(tables || [], { status: 200 })
  } catch (error) {
    console.error('Error in tables GET API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new table
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { number, zone, capacity, status } = body

    // Validate required fields
    if (!number) {
      return NextResponse.json({ error: 'Table number is required' }, { status: 400 })
    }

    // Check if table number already exists
    const { data: existingTable, error: checkError } = await supabase
      .from('tables')
      .select('id')
      .eq('number', number)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing table:', checkError)
      return NextResponse.json({ error: 'Failed to check existing table' }, { status: 500 })
    }

    if (existingTable) {
      return NextResponse.json({ error: 'Table number already exists' }, { status: 409 })
    }

    // Create new table
    const { data: newTable, error } = await supabase
      .from('tables')
      .insert({
        number: parseInt(number),
        zone: zone || 'main',
        capacity: parseInt(capacity) || 4,
        status: status || 'available',
        is_available: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating table:', error)
      return NextResponse.json({ error: 'Failed to create table' }, { status: 500 })
    }

    return NextResponse.json(newTable, { status: 201 })
  } catch (error) {
    console.error('Error in tables POST API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update an existing table
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { id, number, zone, capacity, status, is_available } = body

    if (!id) {
      return NextResponse.json({ error: 'Table ID is required' }, { status: 400 })
    }

    // Check if new table number conflicts with existing tables (excluding current table)
    if (number) {
      const { data: existingTable, error: checkError } = await supabase
        .from('tables')
        .select('id')
        .eq('number', number)
        .neq('id', id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing table:', checkError)
        return NextResponse.json({ error: 'Failed to check existing table' }, { status: 500 })
      }

      if (existingTable) {
        return NextResponse.json({ error: 'Table number already exists' }, { status: 409 })
      }
    }

    // Update table
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (number !== undefined) updateData.number = parseInt(number)
    if (zone !== undefined) updateData.zone = zone
    if (capacity !== undefined) updateData.capacity = parseInt(capacity)
    if (status !== undefined) updateData.status = status
    if (is_available !== undefined) updateData.is_available = is_available

    const { data: updatedTable, error } = await supabase
      .from('tables')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating table:', error)
      return NextResponse.json({ error: 'Failed to update table' }, { status: 500 })
    }

    return NextResponse.json(updatedTable, { status: 200 })
  } catch (error) {
    console.error('Error in tables PUT API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a table
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Table ID is required' }, { status: 400 })
    }

    // Check if table has active orders
    const { data: activeOrders, error: orderError } = await supabase
      .from('orders')
      .select('id')
      .eq('table_number', id)
      .in('status', ['pending', 'preparing'])

    if (orderError) {
      console.error('Error checking active orders:', orderError)
      return NextResponse.json({ error: 'Failed to check active orders' }, { status: 500 })
    }

    if (activeOrders && activeOrders.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete table with active orders' 
      }, { status: 409 })
    }

    // Delete table
    const { error } = await supabase
      .from('tables')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting table:', error)
      return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Table deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error in tables DELETE API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}