import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch active waiter calls (pending, acknowledged, in_progress)
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('active_waiter_calls')
      .select('*')

    if (error) {
      console.error('Error fetching active waiter calls:', error)
      return NextResponse.json(
        { error: 'Failed to fetch active waiter calls' },
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