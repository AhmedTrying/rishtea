import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('staff_profiles')
      .select('user_id, full_name, email, role, phone, hire_date, is_active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching staff:', error)
      return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error in staff API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}