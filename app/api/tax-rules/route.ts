import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get("active") === "true"

    let query = supabase
      .from("tax_rules")
      .select("*")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false })

    if (activeOnly) {
      query = query.eq("is_active", true)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching tax rules:", error)
      return NextResponse.json({ error: "Failed to fetch tax rules" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in tax rules GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.tax_rate) {
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
      .insert([{
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
        customer_type: body.customer_type || "all"
      }])
      .select()

    if (error) {
      console.error("Error creating tax rule:", error)
      return NextResponse.json({ error: "Failed to create tax rule" }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error("Error in tax rules POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}