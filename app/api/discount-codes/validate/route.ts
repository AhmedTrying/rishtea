import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { code, orderTotal } = await request.json()

    console.log("Received discount validation request:", { code, orderTotal })

    if (!code || typeof orderTotal !== "number") {
      return NextResponse.json(
        { error: "كود الخصم والمجموع مطلوبان" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    console.log("Searching for discount code:", code.toUpperCase())

    // Check if discount exists and is active
    const { data: discount, error } = await supabase
      .from("discounts")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("active", true)
      .single()

    console.log("Database query result:", { discount, error })

    if (error || !discount) {
      console.log("Discount not found or error:", error?.message)
      return NextResponse.json(
        { error: "كود الخصم غير صالح أو غير متاح" },
        { status: 404 }
      )
    }

    // Calculate discount amount
    let discountAmount = 0
    
    if (discount.type === "percentage") {
      discountAmount = (orderTotal * discount.amount) / 100
    } else if (discount.type === "fixed") {
      discountAmount = Math.min(discount.amount, orderTotal)
    }

    console.log("Calculated discount:", { discountAmount, type: discount.type, amount: discount.amount })

    return NextResponse.json({
      success: true,
      type: discount.type,
      value: discount.amount,
      discountAmount: Math.round(discountAmount * 100) / 100, // Round to 2 decimal places
      code: discount.code,
      description: discount.description,
    })

  } catch (error) {
    console.error("Error validating discount code:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء التحقق من كود الخصم" },
      { status: 500 }
    )
  }
}