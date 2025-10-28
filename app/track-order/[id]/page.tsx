import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import OrderTrackingClient from "@/components/order-tracking-client"
import { Badge } from "@/components/ui/badge"

function formatCurrency(amount: number) {
  try {
    return new Intl.NumberFormat("ar-SA", { style: "currency", currency: "SAR" }).format(amount)
  } catch {
    return `${amount} ر.س`
  }
}

function formatDate(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleString("ar-SA")
}

export default async function TrackOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Public access: allow viewing order tracking without authentication
  // Customer session is not required; admin features remain protected via middleware.

  const { data: order } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (*),
      customers:customer_id (id, name, email, phone)
    `,
    )
    .eq("id", id)
    .single()

  if (!order) {
    notFound()
  }

  // Build option name map for customizations and add-ons
  const { data: customizationOptions } = await supabase
    .from("customization_options")
    .select("id, name_ar, name_en")
  const { data: productOptionValues } = await supabase
    .from("product_option_values")
    .select("id, value_ar, value_en")
  const { data: addOns } = await supabase
    .from("add_ons")
    .select("id, name_ar, name_en")

  const optionNames: Record<string, string> = {}
  customizationOptions?.forEach((opt: any) => {
    optionNames[opt.id] = opt.name_ar || opt.name_en || opt.id
  })
  productOptionValues?.forEach((val: any) => {
    optionNames[val.id] = val.value_ar || val.value_en || val.id
  })
  addOns?.forEach((addon: any) => {
    optionNames[addon.id] = addon.name_ar || addon.name_en || addon.id
  })

  const subtotal = (order.order_items || []).reduce((sum: number, item: any) => sum + (item.total_price || 0), 0)
  const taxAmount = Number(order.tax_amount || 0)
  const totalAmount = Number(order.total_amount || 0)

  // Simple ETA: delivery +45 minutes, takeaway +25, dine-in N/A
  let estimatedDelivery: string | null = null
  const created = new Date(order.created_at)
  if (order.dining_type === "delivery") {
    const eta = new Date(created.getTime() + 45 * 60 * 1000)
    estimatedDelivery = eta.toLocaleString("ar-SA")
  } else if (order.dining_type === "takeaway") {
    const eta = new Date(created.getTime() + 25 * 60 * 1000)
    estimatedDelivery = eta.toLocaleString("ar-SA")
  }

  const statusLabels: Record<string, string> = {
    pending: "قيد الانتظار",
    preparing: "قيد التحضير",
    ready: "جاهز",
    delivered: "مكتمل",
    cancelled: "ملغي",
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    preparing: "bg-blue-100 text-blue-700",
    ready: "bg-indigo-100 text-indigo-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  }

  return (
    <div className="container mx-auto px-6 py-10 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">تتبع الطلب</h1>
        <p className="text-muted-foreground">رقم الطلب: <span className="font-mono">{order.order_code ?? order.id.slice(0, 8)}</span></p>
      </div>

      {/* Status header */}
      <div className="rounded-lg border p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded ${statusColors[order.status]}`}>{statusLabels[order.status] || order.status}</span>
          <span className="text-sm text-muted-foreground">تاريخ الطلب: {formatDate(order.created_at)}</span>
          {estimatedDelivery && (
            <span className="text-sm font-medium">الاستلام المتوقع: {estimatedDelivery}</span>
          )}
        </div>
        <OrderTrackingClient orderId={order.id} initialStatus={order.status} />
      </div>

      {/* Receipt */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">تفاصيل الطلب</h2>
              <p className="text-sm text-muted-foreground">الطاولة رقم {order.table_number} • نوع الطلب: {order.dining_type || "dine_in"}</p>
            </div>
            <div className="p-4 space-y-4">
              {(order.order_items || []).map((item: any) => (
                <div key={item.id} className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="font-medium">{item.product_name_ar || item.product_name_en}</p>
                    {item.customizations?.selectedSize?.name && (
                      <div>
                        <Badge variant="outline" className="text-xs">
                          الحجم: {item.customizations.selectedSize.name}
                        </Badge>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">الكمية: {item.quantity} • السعر: {formatCurrency(item.unit_price)}</p>

                    {/* Customizations and Add-ons */}
                    {item.customizations && (
                      <div className="space-y-2">
                        {(item.customizations.selectedOptions && Object.keys(item.customizations.selectedOptions).length > 0) && (
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(item.customizations.selectedOptions).map(([groupId, optionValue]) => {
                              if (Array.isArray(optionValue)) {
                                return optionValue.map((value: string, idx: number) => (
                                  <Badge key={`${groupId}-${idx}`} variant="secondary" className="text-xs">
                                    {optionNames[value] || value}
                                  </Badge>
                                ))
                              } else if (optionValue) {
                                const val = optionValue.toString()
                                return (
                                  <Badge key={groupId} variant="secondary" className="text-xs">
                                    {optionNames[val] || val}
                                  </Badge>
                                )
                              }
                              return null
                            })}
                          </div>
                        )}

                        {(item.customizations.sugar || item.customizations.ice) && (
                          <div className="flex flex-wrap gap-1">
                            {item.customizations.sugar && (
                              <Badge variant="outline" className="text-xs">السكر: {item.customizations.sugar}</Badge>
                            )}
                            {item.customizations.ice && (
                              <Badge variant="outline" className="text-xs">الثلج: {item.customizations.ice}</Badge>
                            )}
                          </div>
                        )}

                        {item.customizations.notes && (
                          <div className="p-2 bg-amber-50 rounded text-xs">
                            <strong>ملاحظات خاصة:</strong> {item.customizations.notes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-bold">{formatCurrency(item.total_price)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t">
              <div className="flex justify-between py-1 text-sm">
                <span>المجموع الفرعي</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between py-1 text-sm">
                <span>الضريبة</span>
                <span className="font-medium">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between py-2 text-lg">
                <span className="font-bold">الإجمالي</span>
                <span className="font-bold text-primary">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-bold mb-3">الدفع</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>طريقة الدفع</span><span className="font-medium">{order.payment_method}</span></div>
              <div className="flex justify-between"><span>حالة الدفع</span><span className="font-medium">{order.payment_status}</span></div>
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-bold mb-3">معلومات التواصل</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>الاسم</span><span className="font-medium">{order.customer_name || order.customers?.name || "—"}</span></div>
              <div className="flex justify-between"><span>الهاتف</span><span className="font-medium">{order.customer_phone || order.customers?.phone || "—"}</span></div>
              <div className="flex justify-between"><span>البريد</span><span className="font-medium">{order.customers?.email || "—"}</span></div>
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-bold mb-3">عنوان الشحن</h3>
            {order.dining_type === "delivery" ? (
              <p className="text-sm">لا يوجد عنوان مخزن في النظام الحالي. سيتم التواصل عبر الهاتف لتأكيد العنوان.</p>
            ) : (
              <p className="text-sm text-muted-foreground">هذا الطلب ليس شحناً. ({order.dining_type || "dine_in"})</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}