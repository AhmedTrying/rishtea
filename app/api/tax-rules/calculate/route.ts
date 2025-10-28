import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

interface TaxCalculationRequest {
  orderAmount: number
  diningType: "dine_in" | "takeaway" | "reservation"
  tableNumber?: number
  customerType?: "regular" | "vip" | "staff"
  orderTime?: string // ISO string
}

interface TaxRule {
  id: string
  name: string
  tax_rate: number
  priority: number
  min_order_amount?: number
  max_order_amount?: number
  dining_type: string
  specific_tables?: number[]
  exclude_tables?: number[]
  time_start?: string
  time_end?: string
  days_of_week?: number[]
  customer_type: string
}

interface ApplicableTax {
  id: string
  name: string
  rate: number
  amount: number
  priority: number
}

function isTimeInRange(currentTime: Date, startTime?: string, endTime?: string): boolean {
  if (!startTime || !endTime) return true
  
  const current = currentTime.getHours() * 60 + currentTime.getMinutes()
  const start = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1])
  const end = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1])
  
  if (start <= end) {
    return current >= start && current <= end
  } else {
    // Handle overnight time ranges
    return current >= start || current <= end
  }
}

function isDayApplicable(currentDate: Date, daysOfWeek?: number[]): boolean {
  if (!daysOfWeek || daysOfWeek.length === 0) return true
  return daysOfWeek.includes(currentDate.getDay())
}

function isTableApplicable(tableNumber?: number, specificTables?: number[], excludeTables?: number[]): boolean {
  if (!tableNumber) return true
  
  if (excludeTables && excludeTables.includes(tableNumber)) {
    return false
  }
  
  if (specificTables && specificTables.length > 0) {
    return specificTables.includes(tableNumber)
  }
  
  return true
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body: TaxCalculationRequest = await request.json()

    // Validate required fields
    if (!body.orderAmount || !body.diningType) {
      return NextResponse.json(
        { error: "Order amount and dining type are required" },
        { status: 400 }
      )
    }

    // Get all active tax rules
    const { data: taxRules, error } = await supabase
      .from("tax_rules")
      .select("*")
      .eq("is_active", true)
      .order("priority", { ascending: false })

    if (error) {
      console.error("Error fetching tax rules:", error)
      return NextResponse.json({ error: "Failed to fetch tax rules" }, { status: 500 })
    }

    const orderTime = body.orderTime ? new Date(body.orderTime) : new Date()
    const applicableTaxes: ApplicableTax[] = []

    for (const rule of taxRules as TaxRule[]) {
      let isApplicable = true

      // Check order amount conditions
      if (rule.min_order_amount && body.orderAmount < rule.min_order_amount) {
        isApplicable = false
      }
      if (rule.max_order_amount && body.orderAmount > rule.max_order_amount) {
        isApplicable = false
      }

      // Check dining type
      if (rule.dining_type !== "all" && rule.dining_type !== body.diningType) {
        isApplicable = false
      }

      // Check customer type
      if (rule.customer_type && rule.customer_type !== "all" && body.customerType && rule.customer_type !== body.customerType) {
        isApplicable = false
      }

      // Check table conditions
      if (!isTableApplicable(body.tableNumber, rule.specific_tables, rule.exclude_tables)) {
        isApplicable = false
      }

      // Check time conditions
      if (!isTimeInRange(orderTime, rule.time_start, rule.time_end)) {
        isApplicable = false
      }

      // Check day of week conditions
      if (!isDayApplicable(orderTime, rule.days_of_week)) {
        isApplicable = false
      }

      if (isApplicable) {
        const taxAmount = (body.orderAmount * rule.tax_rate) / 100
        applicableTaxes.push({
          id: rule.id,
          name: rule.name,
          rate: rule.tax_rate,
          amount: taxAmount,
          priority: rule.priority
        })
      }
    }

    // Calculate totals
    const totalTaxRate = applicableTaxes.reduce((sum, tax) => sum + tax.rate, 0)
    const totalTaxAmount = applicableTaxes.reduce((sum, tax) => sum + tax.amount, 0)
    const finalTotal = body.orderAmount + totalTaxAmount

    return NextResponse.json({
      orderAmount: body.orderAmount,
      applicableTaxes,
      totalTaxRate,
      totalTaxAmount,
      finalTotal,
      calculatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error in tax calculation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}