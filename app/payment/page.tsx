"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { CheckCircle2, CreditCard, Wallet, ArrowRight, Tag, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  description?: string
  customization: {
    selectedOptions: Record<string, string | string[]>
    notes: string
    totalPrice: number
    quantity: number
    selectedSize?: { name: string; price: number } | null
    sugar?: string
    ice?: string
  }
}

export default function PaymentPage() {
  const router = useRouter()
  const supabase = createClient()
  const [cart, setCart] = useState<CartItem[]>([])
  const [tableNumber, setTableNumber] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderConfirmed, setOrderConfirmed] = useState(false)
  const [taxRate, setTaxRate] = useState(15)
  const [calculatedTaxes, setCalculatedTaxes] = useState<{
    totalTaxRate: number
    totalTaxAmount: number
    applicableTaxes: Array<{
      id: string
      name: string
      tax_rate: number
      tax_amount: number
    }>
  } | null>(null)
  const [discountCode, setDiscountCode] = useState("")
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string
    type: "percentage" | "fixed"
    value: number
    amount: number
  } | null>(null)
  const [discountError, setDiscountError] = useState("")
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false)
  const [optionNames, setOptionNames] = useState<Record<string, string>>({})
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [minOrderError, setMinOrderError] = useState("")
  const [globalMinOrder, setGlobalMinOrder] = useState<number>(0)
  const [customerMinOrder, setCustomerMinOrder] = useState<number | null>(null)

  // Hydration effect - runs once on mount to load data from sessionStorage
  useEffect(() => {
    const storedCart = sessionStorage.getItem("cart")
    const storedTable = sessionStorage.getItem("tableNumber")

    if (storedCart) {
      setCart(JSON.parse(storedCart))
    }
    if (storedTable) {
      setTableNumber(storedTable)
    }

    // Redirect if no cart
    if (!storedCart || JSON.parse(storedCart).length === 0) {
      router.push("/menu")
    }
  }, [router])

  // Settings and options effect - runs once on mount to fetch static data
  useEffect(() => {
    const fetchTaxRate = async () => {
      const { data } = await supabase.from("settings").select("value").eq("key", "tax_rate").single()
      if (data) {
        setTaxRate(Number.parseFloat(data.value))
      }
    }

    const fetchGlobalMinOrder = async () => {
      const { data } = await supabase.from("settings").select("value").eq("key", "min_order_amount").single()
      if (data && data.value != null) {
        const parsed = Number.parseFloat(data.value)
        setGlobalMinOrder(Number.isFinite(parsed) ? parsed : 0)
      }
    }

    const fetchOptionNames = async () => {
      try {
        console.log('Starting fetchOptionNames...')
        
        // Fetch from customization_options table
        const { data: customizationOptions } = await supabase
          .from("customization_options")
          .select("id, name_ar, name_en")
        
        // Fetch from product_option_values table
        const { data: productOptionValues } = await supabase
          .from("product_option_values")
          .select("id, value_ar, value_en")
        
        // Fetch from add_ons table
        const { data: addOns } = await supabase
          .from("add_ons")
          .select("id, name_ar, name_en")
        
        console.log('Fetched data:', {
          customizationOptions,
          productOptionValues,
          addOns
        })
        
        const optionMap: Record<string, string> = {}
        
        // Add customization options (these are the actual option values)
        if (customizationOptions) {
          customizationOptions.forEach(option => {
            optionMap[option.id] = option.name_ar || option.name_en || option.id
          })
        }
        
        // Add product option values
        if (productOptionValues) {
          productOptionValues.forEach(value => {
            optionMap[value.id] = value.value_ar || value.value_en || value.id
          })
        }
        
        // Add add-ons (no prefix needed as they're stored directly)
        if (addOns) {
          addOns.forEach(addon => {
            optionMap[addon.id] = addon.name_ar || addon.name_en || addon.id
          })
        }
        
        console.log('Final optionMap:', optionMap)
        setOptionNames(optionMap)
      } catch (error) {
        console.error("Error fetching option names:", error)
      }
    }

    fetchTaxRate()
    fetchOptionNames()
    fetchGlobalMinOrder()
  }, [supabase])

  // Fetch customer-specific minimum when phone changes
  useEffect(() => {
    const phone = customerPhone.trim()
    if (!phone) {
      setCustomerMinOrder(null)
      return
    }
    const fetchCustomerMin = async () => {
      try {
        const { data, error } = await supabase
          .from("customers")
          .select("min_order_amount")
          .eq("phone", phone)
          .limit(1)
          .single()
        if (!error && data && data.min_order_amount != null) {
          const amt = Number(data.min_order_amount)
          setCustomerMinOrder(Number.isFinite(amt) ? amt : null)
        } else {
          setCustomerMinOrder(null)
        }
      } catch {
        setCustomerMinOrder(null)
      }
    }
    fetchCustomerMin()
  }, [customerPhone, supabase])

  // Tax calculation effect - runs when cart, discount, or table changes
  // Calculate totals first
  const totalPrice = cart.reduce((sum, item) => {
    const customizationQty = item.customization?.quantity || 1
    const unitCustomizedPrice = item.customization?.totalPrice
      ? item.customization.totalPrice / customizationQty
      : item.price
    return sum + unitCustomizedPrice * item.quantity
  }, 0)
  const discountAmount = appliedDiscount?.amount || 0
  const discountedTotal = totalPrice - discountAmount
  
  // Service charge: disabled by default (set via env if needed)
  const envServiceChargeRate = Number.parseFloat(process.env.NEXT_PUBLIC_SERVICE_CHARGE_RATE || "0")
  const envServiceChargeFixed = Number.parseFloat(process.env.NEXT_PUBLIC_SERVICE_CHARGE_FIXED || "0")
  const serviceChargeRate = Number.isFinite(envServiceChargeRate) ? envServiceChargeRate : 0
  const serviceChargeFixed = Number.isFinite(envServiceChargeFixed) ? envServiceChargeFixed : 0
  const serviceCharge = serviceChargeFixed > 0 ? serviceChargeFixed : discountedTotal * serviceChargeRate
  
  // Base amount for tax calculation (use discounted total; exclude service charge from tax base unless policy requires otherwise)
  const taxableAmount = discountedTotal

  useEffect(() => {
    const calculateTaxes = async () => {
      if (cart.length === 0) {
        setCalculatedTaxes(null)
        return
      }

      try {
        const response = await fetch("/api/tax-rules/calculate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderAmount: taxableAmount, // Use taxable amount (discounted total + service charge)
            diningType: "dine_in", // You can make this dynamic based on order type
            tableNumber: tableNumber ? parseInt(tableNumber) : undefined,
            customerType: "regular", // You can make this dynamic based on customer
          }),
        })

        if (response.ok) {
          const taxData = await response.json()
          setCalculatedTaxes(taxData)
        } else {
          // Fallback to default tax rate if tax rules calculation fails
          console.warn("Tax rules calculation failed, using default tax rate")
          setCalculatedTaxes(null)
        }
      } catch (error) {
        console.error("Error calculating taxes:", error)
        setCalculatedTaxes(null)
      }
    }

    calculateTaxes()
  }, [cart, appliedDiscount, tableNumber, taxableAmount])
  
  // Use calculated taxes if available, otherwise fallback to default tax rate
  // Note: We need to update the API call to use the taxable amount instead of just discounted total
  const tax = calculatedTaxes ? calculatedTaxes.totalTaxAmount : (taxableAmount * taxRate) / 100
  const finalTotal = discountedTotal + serviceCharge + tax
  const activeMinOrder = Math.max(globalMinOrder || 0, customerMinOrder || 0)

  const applyDiscount = async () => {
    if (!discountCode.trim()) return

    setIsApplyingDiscount(true)
    setDiscountError("")

    try {
      const response = await fetch("/api/discount-codes/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: discountCode.trim(),
          orderTotal: totalPrice,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setDiscountError(data.error || "كود الخصم غير صالح")
        return
      }

      setAppliedDiscount({
        code: discountCode.trim(),
        type: data.type,
        value: data.value,
        amount: data.discountAmount,
      })
      setDiscountCode("")
    } catch (error) {
      console.error("Error applying discount:", error)
      setDiscountError("حدث خطأ أثناء تطبيق كود الخصم")
    } finally {
      setIsApplyingDiscount(false)
    }
  }

  const removeDiscount = () => {
    setAppliedDiscount(null)
    setDiscountError("")
  }

  const handlePayment = async () => {
    if (!paymentMethod) return

    setIsProcessing(true)
    setMinOrderError("")

    try {
      // Enforce minimum order based on customer-specific or global setting
      const minAmt = activeMinOrder
      if (minAmt > 0 && finalTotal < minAmt) {
        setIsProcessing(false)
        setMinOrderError(`الحد الأدنى للطلب هو ${minAmt.toFixed(2)} ر.س. الرجاء زيادة المبلغ.`)
        return
      }

      const parsedTable = Number.parseInt(tableNumber, 10)
      if (Number.isNaN(parsedTable)) {
        throw new Error("Invalid table number")
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          table_number: parsedTable,
          status: "pending",
          total_amount: finalTotal,
          tax_amount: tax,
          payment_method: paymentMethod,
          payment_status: paymentMethod === "cash" ? "pending" : "paid",
          customer_name: customerName || null,
          customer_phone: customerPhone || null,
        })
        .select()
        .single()

      if (orderError) {
        console.error("[v0] Order insert error:", {
          message: (orderError as any)?.message,
          details: (orderError as any)?.details,
          hint: (orderError as any)?.hint,
          code: (orderError as any)?.code,
        })
        throw orderError
      }

      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name_ar: item.name,
        product_name_en: undefined,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        customizations: item.customization,
        notes: item.customization.notes || null,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) {
        console.error("[v0] Order items insert error:", {
          message: (itemsError as any)?.message,
          details: (itemsError as any)?.details,
          hint: (itemsError as any)?.hint,
          code: (itemsError as any)?.code,
        })
        throw itemsError
      }

      // Tax information is already stored in the order record (tax_amount field)
      // No need for separate applied_taxes table as tax rules are calculated dynamically

      setIsProcessing(false)
      setOrderConfirmed(true)

      // Clear cart after 3 seconds and redirect
      setTimeout(() => {
        sessionStorage.removeItem("cart")
        sessionStorage.removeItem("tableNumber")
        router.push(`/track-order/${order.id}`)
      }, 1500)
    } catch (error) {
      console.error("[v0] Error creating order:", error)
      setIsProcessing(false)
      alert("حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى.")
    }
  }

  if (orderConfirmed) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{
          backgroundImage:
            "url('/baking-pattern.svg'), linear-gradient(to bottom right, var(--background), var(--background), rgba(230,213,184,0.2))",
          backgroundSize: "200px 200px, auto",
          backgroundRepeat: "repeat, no-repeat",
          backgroundPosition: "top left, center",
        }}
      >
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-primary/10 rounded-full p-6">
              <CheckCircle2 className="h-16 w-16 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">تم تأكيد طلبك!</h1>
            <p className="text-muted-foreground text-lg">سيتم تحضير طلبك الآن</p>
          </div>
          <div className="bg-muted rounded-2xl p-6">
            <p className="text-sm text-muted-foreground mb-2">رقم الطاولة</p>
            <p className="text-4xl font-bold text-primary">{tableNumber}</p>
          </div>
          <p className="text-sm text-muted-foreground">جاري التحويل إلى القائمة...</p>
        </Card>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage:
          "url('/baking-pattern.svg'), linear-gradient(to bottom right, var(--background), var(--background), rgba(230,213,184,0.2))",
        backgroundSize: "200px 200px, auto",
        backgroundRepeat: "repeat, no-repeat",
        backgroundPosition: "top left, center",
      }}
    >
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <Link href="/menu" className="flex items-center gap-4">
              <Image src="/logo.png" alt=" " width={48} height={48} className="rounded-2xl shadow-sm" />
              <div>
                <h1 className="text-2xl font-bold"> </h1>
                <p className="text-sm text-muted-foreground font-medium">الدفع</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-10 max-w-4xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">ملخص الطلب</h2>
              <p className="text-muted-foreground">{tableNumber ? `الطاولة رقم ${tableNumber}` : "الطاولة غير محددة"}</p>
            </div>

            <Card className="p-6 space-y-6">
              {cart.map((item, index) => (
                <div key={`${item.id}-${index}`} className="border-b border-border/50 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover border border-border/50"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-foreground">{item.name}</h4>
                          {item.customization?.selectedSize && (
                            <div className="mt-1">
                              <Badge variant="outline" className="text-xs">
                                الحجم: {item.customization.selectedSize.name}
                              </Badge>
                            </div>
                          )}
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-muted-foreground">الكمية: {item.quantity}</span>
                            <span className="text-sm text-muted-foreground">السعر الأساسي: {item.price} ر.س</span>
                          </div>
                        </div>
                        <div className="text-left">
                          <span className="font-bold text-xl text-primary">{(() => {
                            const customizationQty = item.customization?.quantity || 1
                            const unitCustomizedPrice = item.customization?.totalPrice
                              ? item.customization.totalPrice / customizationQty
                              : item.price
                            return unitCustomizedPrice * item.quantity
                          })()} ر.س</span>
                          <p className="text-sm text-muted-foreground">المجموع</p>
                        </div>
                      </div>

                      {/* Customization Details */}
                      {(item.customization.selectedOptions && Object.keys(item.customization.selectedOptions).length > 0) && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-semibold text-foreground">التخصيصات:</h5>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(item.customization.selectedOptions).map(([groupId, optionValue]) => {
                              console.log('Processing customization:', { groupId, optionValue, optionNames })
                              
                              if (Array.isArray(optionValue)) {
                                return optionValue.map((value, idx) => {
                                  console.log('Array value lookup:', { value, mapped: optionNames[value] })
                                  return (
                                    <Badge key={`${groupId}-${idx}`} variant="secondary" className="text-xs">
                                      {optionNames[value] || value}
                                    </Badge>
                                  )
                                })
                              } else if (optionValue) {
                                console.log('Single value lookup:', { optionValue, mapped: optionNames[optionValue] })
                                return (
                                  <Badge key={groupId} variant="secondary" className="text-xs">
                                    {optionNames[optionValue] || optionValue}
                                  </Badge>
                                )
                              }
                              return null
                            })}
                          </div>
                        </div>
                      )}

                      {/* Legacy Customization Support */}
                      {(item.customization.sugar || item.customization.ice) && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-semibold text-foreground">التخصيصات:</h5>
                          <div className="flex flex-wrap gap-2">
                            {item.customization.sugar && (
                              <Badge variant="secondary" className="text-xs">
                                السكر: {item.customization.sugar}
                              </Badge>
                            )}
                            {item.customization.ice && (
                              <Badge variant="secondary" className="text-xs">
                                الثلج: {item.customization.ice}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Customer Notes */}
                      {item.customization.notes && (
                        <div className="bg-muted/50 p-3 rounded-lg border border-border/30">
                          <h5 className="text-sm font-semibold text-foreground mb-1">ملاحظات خاصة:</h5>
                          <p className="text-sm text-muted-foreground">{item.customization.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>لا توجد عناصر في السلة</p>
                </div>
              )}
            </Card>

            {/* Price Breakdown */}
            <Card className="p-6 space-y-3">
              <div className="flex justify-between text-lg">
                <span>المجموع الفرعي</span>
                <span className="font-semibold">{totalPrice.toFixed(2)} ر.س</span>
              </div>
              
              {/* Discount Section */}
              {!appliedDiscount ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="أدخل كود الخصم"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && applyDiscount()}
                      className="flex-1"
                    />
                    <Button
                      onClick={applyDiscount}
                      disabled={!discountCode.trim() || isApplyingDiscount}
                      variant="outline"
                      size="sm"
                    >
                      {isApplyingDiscount ? "..." : <Tag className="h-4 w-4" />}
                    </Button>
                  </div>
                  {discountError && (
                    <p className="text-sm text-destructive">{discountError}</p>
                  )}
                </div>
              ) : (
                <div className="flex justify-between items-center text-lg bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-green-600" />
                    <span className="text-green-700 dark:text-green-300">
                      خصم ({appliedDiscount.code})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-green-700 dark:text-green-300">
                      -{appliedDiscount.amount.toFixed(2)} ر.س
                    </span>
                    <Button
                      onClick={removeDiscount}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Tax Section */}
              {calculatedTaxes && calculatedTaxes.applicableTaxes.length > 0 ? (
                <div className="space-y-2">
                  {calculatedTaxes.applicableTaxes.map((taxRule) => (
                    <div key={taxRule.id} className="flex justify-between text-lg">
                      <span>{taxRule.name} ({Number(taxRule.rate ?? 0).toFixed(0)}%)</span>
                      <span className="font-semibold">{Number(taxRule.amount ?? 0).toFixed(2)} ر.س</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-between text-lg">
                  <span>ضريبة القيمة المضافة ({taxRate}%)</span>
                  <span className="font-semibold">{tax.toFixed(2)} ر.س</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-2xl font-bold">
                <span>المجموع الكلي</span>
                <span className="text-primary">{finalTotal.toFixed(2)} ر.س</span>
              </div>
              {activeMinOrder > 0 && (
                <div className="mt-2 text-sm">
                  <p className="text-muted-foreground">الحد الأدنى للطلب: {activeMinOrder.toFixed(2)} ر.س</p>
                  {finalTotal < activeMinOrder && (
                    <p className="text-destructive">المجموع الحالي أقل من الحد الأدنى. الرجاء زيادة المبلغ.</p>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Payment Method */}
          <div className="space-y-6">
            {/* Table Selection */}
            <h2 className="text-3xl font-bold">رقم الطاولة</h2>
            <Card className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold" htmlFor="tableNumber">أدخل رقم الطاولة</label>
                <Input
                  id="tableNumber"
                  type="number"
                  placeholder="مثال: 5"
                  value={tableNumber}
                  min={1}
                  onChange={(e) => {
                    const val = e.target.value
                    setTableNumber(val)
                    try { sessionStorage.setItem("tableNumber", val) } catch {}
                  }}
                />
                {!tableNumber && (
                  <p className="text-sm text-destructive">يرجى إدخال رقم الطاولة قبل الدفع</p>
                )}
              </div>
            </Card>
            {/* Customer Info */}
            <h2 className="text-3xl font-bold">معلومات العميل</h2>
            <Card className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">الاسم</label>
                <Input
                  placeholder="اكتب اسمك"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">رقم الجوال</label>
                <Input
                  placeholder="05xxxxxxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  inputMode="tel"
                />
              </div>
            </Card>

             <h2 className="text-3xl font-bold">طريقة الدفع</h2>

            <div className="space-y-4">
              <Card
                className={`p-6 cursor-pointer transition-all border-2 ${
                  paymentMethod === "cash" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
                onClick={() => setPaymentMethod("cash")}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 rounded-full p-4">
                    <Wallet className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">الدفع نقداً</h3>
                    <p className="text-sm text-muted-foreground">ادفع عند استلام الطلب</p>
                  </div>
                  {paymentMethod === "cash" && <CheckCircle2 className="h-6 w-6 text-primary" />}
                </div>
              </Card>

              <Card
                className={`p-6 cursor-pointer transition-all border-2 ${
                  paymentMethod === "card" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
                onClick={() => setPaymentMethod("card")}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 rounded-full p-4">
                    <CreditCard className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">بطاقة ائتمان</h3>
                    <p className="text-sm text-muted-foreground">ادفع ببطاقة الائتمان أو مدى</p>
                  </div>
                  {paymentMethod === "card" && <CheckCircle2 className="h-6 w-6 text-primary" />}
                </div>
              </Card>
            </div>

            <Button
              onClick={handlePayment}
              disabled={!paymentMethod || isProcessing || !tableNumber || Number.isNaN(Number.parseInt(tableNumber, 10)) || (activeMinOrder > 0 && finalTotal < activeMinOrder)}
              className="w-full h-14 text-xl font-semibold shadow-lg rounded-full"
              size="lg"
            >
              {isProcessing ? (
                "جاري المعالجة..."
              ) : (
                <>
                  تأكيد الدفع
                  <ArrowRight className="mr-2 h-5 w-5" />
                </>
              )}
            </Button>
            {minOrderError && (
              <p className="text-sm text-destructive mt-2">{minOrderError}</p>
            )}

            <Button
              variant="outline"
              onClick={() => router.back()}
              className="w-full h-12 rounded-full"
              disabled={isProcessing}
            >
              العودة للسلة
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
