import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("tax_rules")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Error fetching tax rule:", error)
      return NextResponse.json({ error: "Tax rule not found" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in tax rule GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Validate required fields
    if (!body.name || body.tax_rate === undefined) {
      return NextResponse.json(
        { error: "Name and tax rate are required" },
        { status: 400 }
      )
    }

    // Validate tax rate
    if (body.tax_rate < 0 || body.tax_rate > 100) {
      return NextResponse.json(
        { error: "Tax rate must be between 0 and 100" },
        { status: 400 }
      )
    }

    // Validate dining type
    if (body.dining_type && !["dine_in", "takeaway", "reservation", "all"].includes(body.dining_type)) {
      return NextResponse.json(
        { error: "Invalid dining type" },
        { status: 400 }
      )
    }

    // Validate customer type
    if (body.customer_type && !["regular", "vip", "staff", "all"].includes(body.customer_type)) {
      return NextResponse.json(
        { error: "Invalid customer type" },
        { status: 400 }
      )
    }

    // Validate order amounts
    if (body.min_order_amount && body.max_order_amount && body.min_order_amount > body.max_order_amount) {
      return NextResponse.json(
        { error: "Minimum order amount cannot be greater than maximum order amount" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("tax_rules")
      .update({
        name: body.name,
        description: body.description || null,
        tax_rate: body.tax_rate,
        is_active: body.is_active ?? true,
        priority: body.priority || 0,
        min_order_amount: body.min_order_amount || null,
        max_order_amount: body.max_order_amount || null,
        dining_type: body.dining_type || "all",
        specific_tables: body.specific_tables || null,
        exclude_tables: body.exclude_tables || null,
        time_start: body.time_start || null,
        time_end: body.time_end || null,
        days_of_week: body.days_of_week || null,
        customer_type: body.customer_type || "all",
        updated_at: new Date().toISOString()
      })
      .eq("id", params.id)
      .select()

    if (error) {
      console.error("Error updating tax rule:", error)
      return NextResponse.json({ error: "Failed to update tax rule" }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Tax rule not found" }, { status: 404 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Error in tax rule PUT:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Tax rules can be deleted since we don't store applied taxes separately
    // Tax information is stored in the order record itself

    const { error } = await supabase
      .from("tax_rules")
      .delete()
      .eq("id", params.id)

    if (error) {
      console.error("Error deleting tax rule:", error)
      return NextResponse.json({ error: "Failed to delete tax rule" }, { status: 500 })
    }

    return NextResponse.json({ message: "Tax rule deleted successfully" })
  } catch (error) {
    console.error("Error in tax rule DELETE:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}