"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Edit, Trash2, Save, X, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const ORDER_TYPES = [
  { label: "تناول في المطعم", value: "dine_in" },
  { label: "طلب خارجي", value: "takeaway" },
  { label: "حجز", value: "reservation" },
]

type DiscountCode = {
  id: string
  name: string
  code: string
  description?: string
  amount: number
  type: "fixed" | "percentage"
  applies_to: "order" | "product" | "category"
  active: boolean
  created_at: string
  updated_at: string
}

const defaultForm: DiscountCode = {
  id: "",
  name: "",
  code: "",
  description: "",
  amount: 0,
  type: "percentage",
  applies_to: "order",
  active: true,
  created_at: "",
  updated_at: "",
}

export default function DiscountManagement() {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<DiscountCode>(defaultForm)
  const [showForm, setShowForm] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchDiscounts()
  }, [])

  const fetchDiscounts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("discounts")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setDiscounts(data || [])
    } catch (error) {
      console.error("Error fetching discounts:", error)
      toast({
        title: "خطأ",
        description: "فشل في تحميل الخصومات",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name || !formData.code || !formData.amount) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      // Only include fields that exist in the database
      const discountData = {
        name: formData.name,
        code: formData.code,
        description: formData.description || null,
        amount: formData.amount,
        type: formData.type,
        applies_to: formData.applies_to,
        active: formData.active,
      }

      if (editingId) {
        const { error } = await supabase
          .from("discounts")
          .update({
            ...discountData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)

        if (error) throw error
        toast({
          title: "نجح",
          description: "تم تحديث الخصم بنجاح",
        })
      } else {
        const { error } = await supabase
          .from("discounts")
          .insert([discountData])

        if (error) throw error
        toast({
          title: "نجح",
          description: "تم إضافة الخصم بنجاح",
        })
      }

      setFormData(defaultForm)
      setEditingId(null)
      setShowForm(false)
      fetchDiscounts()
    } catch (error) {
      console.error("Error saving discount:", error)
      toast({
        title: "خطأ",
        description: "فشل في حفظ الخصم",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (discount: DiscountCode) => {
    setFormData(discount)
    setEditingId(discount.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("discounts")
        .delete()
        .eq("id", id)

      if (error) throw error
      toast({
        title: "نجح",
        description: "تم حذف الخصم بنجاح",
      })
      fetchDiscounts()
    } catch (error) {
      console.error("Error deleting discount:", error)
      toast({
        title: "خطأ",
        description: "فشل في حذف الخصم",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    setFormData(defaultForm)
    setEditingId(null)
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة الخصومات</h2>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة خصم جديد
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? "تعديل الخصم" : "إضافة خصم جديد"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم الخصم</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="أدخل اسم الخصم (مثل: خصم العملاء الجدد)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">كود الخصم *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="أدخل كود الخصم (مثل: SAVE10)"
                />
                <p className="text-xs text-muted-foreground">
                  سيتم استخدام هذا الكود في صفحة الدفع
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">قيمة الخصم</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount.toString()}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="أدخل قيمة الخصم"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">نوع الخصم</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "fixed" | "percentage") => 
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">نسبة مئوية (%)</SelectItem>
                    <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="applies_to">ينطبق على</Label>
                <Select
                  value={formData.applies_to}
                  onValueChange={(value: "order" | "product" | "category") => 
                    setFormData({ ...formData, applies_to: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="order">الطلب كاملاً</SelectItem>
                    <SelectItem value="product">منتج محدد</SelectItem>
                    <SelectItem value="category">فئة محددة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires_at">تاريخ انتهاء الصلاحية</Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  value={formData.expires_at || ""}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usage_limit">حد الاستخدام</Label>
                <Input
                  id="usage_limit"
                  type="number"
                  value={formData.usage_limit || ""}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="اتركه فارغاً للاستخدام غير المحدود"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_order_amount">الحد الأدنى لقيمة الطلب</Label>
                <Input
                  id="min_order_amount"
                  type="number"
                  step="0.01"
                  value={formData.min_order_amount || ""}
                  onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="الحد الأدنى لقيمة الطلب"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_discount_amount">الحد الأقصى لقيمة الخصم</Label>
                <Input
                  id="max_discount_amount"
                  type="number"
                  step="0.01"
                  value={formData.max_discount_amount || ""}
                  onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="الحد الأقصى لقيمة الخصم"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">وصف الخصم</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="أدخل وصف الخصم (اختياري)"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label htmlFor="active">نشط</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <Save className="w-4 h-4" />
                {editingId ? "تحديث" : "حفظ"}
              </Button>
              <Button variant="outline" onClick={handleCancel} className="gap-2">
                <X className="w-4 h-4" />
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {discounts.map((discount) => (
          <Card key={discount.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{discount.name}</h3>
                    <Badge variant="outline" className="font-mono">
                      {discount.code}
                    </Badge>
                    <Badge variant={discount.active ? "default" : "secondary"}>
                      {discount.active ? "نشط" : "غير نشط"}
                    </Badge>
                  </div>
                  {discount.description && (
                    <p className="text-sm text-muted-foreground">{discount.description}</p>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <span>
                      القيمة: {discount.amount}
                      {discount.type === "percentage" ? "%" : " ريال"}
                    </span>
                    <span>
                      ينطبق على: {
                        discount.applies_to === "order" ? "الطلب كاملاً" :
                        discount.applies_to === "product" ? "منتج محدد" :
                        "فئة محددة"
                      }
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(discount)}
                    className="gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    تعديل
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(discount.id)}
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    حذف
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {discounts.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">لا توجد خصومات مضافة بعد</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}