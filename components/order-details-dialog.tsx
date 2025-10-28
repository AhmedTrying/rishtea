"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"

interface OrderDetailsDialogProps {
  order: {
    id: string
    table_number: number
    status: string
    total_amount: number
    subtotal?: number
    tax_amount: number
    service_charge?: number
    discount_amount?: number
    discount_code?: string
    payment_method: string
    payment_status: string
    created_at: string
    order_items: any[]
    // Add customer info fields
    customer_name?: string
    customer_phone?: string
  }
  onClose: () => void
}

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  preparing: "قيد التحضير",
  ready: "جاهز",
  delivered: "مكتمل",
  cancelled: "ملغي",
}
// Add missing statusColors for badge variants
const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  preparing: "default",
  ready: "default",
  delivered: "outline",
  cancelled: "destructive",
}

const paymentStatusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  paid: "مدفوع",
  failed: "فشل",
}

export default function OrderDetailsDialog({ order, onClose }: OrderDetailsDialogProps) {
  const router = useRouter()
  const supabase = createClient()
  const [status, setStatus] = useState(order.status)
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status)
  const [isLoading, setIsLoading] = useState(false)
  const [optionNames, setOptionNames] = useState<Record<string, string>>({})

  // Fetch option names for proper display
  useEffect(() => {
    const fetchOptionNames = async () => {
      try {
        // Fetch from add_ons table
        const { data: addOns } = await supabase
          .from("add_ons")
          .select("id, name_ar, name_en")
        
        // Fetch from customization_options table
        const { data: customizationOptions } = await supabase
          .from("customization_options")
          .select("id, name_ar, name_en")
        
        // Fetch from product_option_values table
        const { data: productOptionValues } = await supabase
          .from("product_option_values")
          .select("id, value_ar, value_en")
        
        const optionMap: Record<string, string> = {}
        
        // Add add-ons
        if (addOns) {
          addOns.forEach(addon => {
            optionMap[addon.id] = addon.name_ar || addon.name_en || addon.id
          })
        }
        
        // Add customization options
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
        
        setOptionNames(optionMap)
      } catch (error) {
        console.error("Error fetching option names:", error)
      }
    }

    fetchOptionNames()
  }, [supabase])

  const handleUpdate = async () => {
    setIsLoading(true)

    const { error } = await supabase
      .from("orders")
      .update({
        status,
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)

    if (!error) {
      onClose()
      router.refresh()
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="font-mono">#{order.order_code ?? order.id.slice(0, 8)}</span>
            <Badge variant={statusColors[order.status] ?? "secondary"}>
              {statusLabels[order.status] ?? order.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">رقم الطلب</div>
              <div className="font-mono">{order.order_code ?? order.id}</div>
            </div>
            <div>
              <div className="text-muted-foreground">رقم الطاولة</div>
              <div className="font-bold">#{order.table_number}</div>
            </div>
            <div>
              <div className="text-muted-foreground">اسم العميل</div>
              <div>{order.customer_name || "-"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">رقم الجوال</div>
              <div>{order.customer_phone || "-"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">الحالة</div>
              <Badge variant={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
            </div>
            <div>
              <div className="text-muted-foreground">طريقة الدفع</div>
              <div>{order.payment_method === "cash" ? "نقدي" : "بطاقة"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">حالة الدفع</div>
              <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                {paymentStatusLabels[order.payment_status]}
              </Badge>
            </div>
            <div>
              <div className="text-muted-foreground">التاريخ</div>
              <div>{format(new Date(order.created_at), "dd MMM yyyy, HH:mm", { locale: ar })}</div>
            </div>
          </div>

          {/* Status Updates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>حالة الطلب</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="preparing">قيد التحضير</SelectItem>
                  <SelectItem value="ready">جاهز</SelectItem>
                  <SelectItem value="delivered">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>حالة الدفع</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="paid">مدفوع</SelectItem>
                  <SelectItem value="failed">فشل</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">المنتجات</Label>
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between items-start p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{item.product_name_ar}</p>
                  <p className="text-sm text-muted-foreground">الكمية: {item.quantity}</p>
                  {item.customizations && (
                    <div className="mt-2 space-y-1">
                      {/* Selected Size */}
                      {item.customizations.selectedSize?.name && (
                        <Badge variant="outline" className="text-xs">
                          الحجم: {item.customizations.selectedSize.name}
                        </Badge>
                      )}
                      {/* Sugar Level */}
                      {item.customizations.sugar && (
                        <Badge variant="outline" className="text-xs">
                          سكر: {item.customizations.sugar}
                        </Badge>
                      )}
                      {/* Ice Level */}
                      {item.customizations.ice && (
                        <Badge variant="outline" className="text-xs">
                          ثلج: {item.customizations.ice}
                        </Badge>
                      )}
                      {/* Selected Options */}
                      {item.customizations.selectedOptions && Object.entries(item.customizations.selectedOptions).map(([groupName, options]: [string, any]) => (
                        <div key={groupName} className="flex flex-wrap gap-1">
                          {Array.isArray(options) ? options.map((option: any, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {option.name_ar} {option.price_modifier > 0 && `(+${option.price_modifier} ر.س)`}
                            </Badge>
                          )) : (
                            <Badge variant="secondary" className="text-xs">
                              {options.name_ar} {options.price_modifier > 0 && `(+${options.price_modifier} ر.س)`}
                            </Badge>
                          )}
                        </div>
                      ))}
                      {/* Add-ons */}
                      {item.customizations.selectedOptions && item.customizations.selectedOptions['add-ons'] && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs font-semibold text-muted-foreground mb-1 w-full">الإضافات:</span>
                          {Array.isArray(item.customizations.selectedOptions['add-ons']) 
                            ? item.customizations.selectedOptions['add-ons'].map((addonId: string, idx: number) => {
                                const displayName = optionNames[addonId] || `إضافة #${addonId}`;
                                return (
                                  <Badge key={idx} variant="outline" className="text-xs bg-blue-50">
                                    {displayName}
                                  </Badge>
                                );
                              })
                            : (() => {
                                const addonId = item.customizations.selectedOptions['add-ons'].toString();
                                const displayName = optionNames[addonId] || `إضافة #${addonId}`;
                                return (
                                  <Badge variant="outline" className="text-xs bg-blue-50">
                                    {displayName}
                                  </Badge>
                                );
                              })()
                          }
                        </div>
                      )}
                      {/* Customer Notes */}
                      {item.customizations.notes && (
                        <div className="p-2 bg-amber-50 rounded text-xs">
                          <strong>ملاحظات خاصة:</strong> {item.customizations.notes}
                        </div>
                      )}
                    </div>
                  )}
                  {item.notes && <p className="text-sm text-muted-foreground mt-1">ملاحظات: {item.notes}</p>}
                </div>
                <div className="text-left">
                  <p className="font-bold">{item.total_price.toFixed(2)} ر.س</p>
                  <p className="text-sm text-muted-foreground">{item.unit_price.toFixed(2)} ر.س / قطعة</p>
                </div>
              </div>
            ))}
          </div>

          {order.notes && (
            <>
              <Separator />
              <div>
                <Label className="text-muted-foreground">ملاحظات الطلب</Label>
                <p className="mt-1">{order.notes}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            {order.subtotal && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">المجموع الفرعي (قبل الخصم)</span>
                <span>{order.subtotal.toFixed(2)} ر.س</span>
              </div>
            )}
            {order.discount_amount && order.discount_amount > 0 && (
              <>
                <div className="flex justify-between text-sm text-green-600">
                  <span>الخصم {order.discount_code && `(${order.discount_code})`}</span>
                  <span>-{order.discount_amount.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المجموع بعد الخصم</span>
                  <span>{((order.subtotal || order.total_amount - order.tax_amount) - order.discount_amount).toFixed(2)} ر.س</span>
                </div>
              </>
            )}
            {order.service_charge && order.service_charge > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">رسوم الخدمة (13%)</span>
                <span>{order.service_charge.toFixed(2)} ر.س</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">الضريبة</span>
              <span>{order.tax_amount.toFixed(2)} ر.س</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>المجموع الكلي</span>
              <span>{order.total_amount.toFixed(2)} ر.س</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            إغلاق
          </Button>
          <Button onClick={handleUpdate} disabled={isLoading}>
            {isLoading ? "جاري التحديث..." : "تحديث الطلب"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
