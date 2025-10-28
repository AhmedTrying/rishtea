import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch waiter calls
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    
    const status = searchParams.get('status')
    const tableNumber = searchParams.get('table_number')
    const limit = searchParams.get('limit')
    
    let query = supabase
      .from('waiter_calls')
      .select(`
        id,
        table_number,
        customer_name,
        phone_number,
        request_type,
        message,
        status,
        priority,
        created_at,
        acknowledged_at,
        completed_at,
        acknowledged_by,
        completed_by,
        notes
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    
    if (tableNumber) {
      query = query.eq('table_number', parseInt(tableNumber))
    }
    
    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching waiter calls:', error)
      return NextResponse.json(
        { error: 'Failed to fetch waiter calls' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new waiter call
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    
    const {
      table_number,
      customer_name,
      phone_number,
      request_type = 'general',
      message,
      priority
    } = body

    // Validate required fields
    if (!table_number) {
      return NextResponse.json(
        { error: 'Table number is required' },
        { status: 400 }
      )
    }

    // Validate table_number is a positive integer
    if (!Number.isInteger(table_number) || table_number <= 0) {
      return NextResponse.json(
        { error: 'Table number must be a positive integer' },
        { status: 400 }
      )
    }

    // Validate request_type
    const validRequestTypes = ['general', 'order', 'bill', 'assistance', 'complaint']
    if (!validRequestTypes.includes(request_type)) {
      return NextResponse.json(
        { error: 'Invalid request type' },
        { status: 400 }
      )
    }

    // Set default priority if not provided, and validate if provided
    const finalPriority = priority || 'normal'
    const validPriorities = ['low', 'normal', 'high', 'urgent']
    if (!validPriorities.includes(finalPriority)) {
      return NextResponse.json(
        { error: 'Invalid priority level' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('waiter_calls')
      .insert({
        table_number,
        customer_name,
        phone_number,
        request_type,
        message,
        priority: finalPriority,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating waiter call:', error)
      return NextResponse.json(
        { error: 'Failed to create waiter call' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      data,
      message: 'Waiter call created successfully' 
    }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update waiter call status
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    
    const {
      id,
      status,
      acknowledged_by,
      completed_by,
      notes
    } = body

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'Waiter call ID is required' },
        { status: 400 }
      )
    }

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['pending', 'acknowledged', 'in_progress', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const updateData: any = { status }
    
    if (acknowledged_by) {
      updateData.acknowledged_by = acknowledged_by
    }
    
    if (completed_by) {
      updateData.completed_by = completed_by
    }
    
    if (notes) {
      updateData.notes = notes
    }

    const { data, error } = await supabase
      .from('waiter_calls')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating waiter call:', error)
      return NextResponse.json(
        { error: 'Failed to update waiter call' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      data,
      message: 'Waiter call updated successfully' 
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete waiter call
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Waiter call ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('waiter_calls')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting waiter call:', error)
      return NextResponse.json(
        { error: 'Failed to delete waiter call' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Waiter call deleted successfully' 
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}