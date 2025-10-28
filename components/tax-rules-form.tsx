"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, X, Trash2, Edit, Save, Download, Printer } from "lucide-react"

interface TaxRule {
  id?: string
  name: string
  description: string
  tax_rate: number
  is_active: boolean
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
  created_at?: string
  updated_at?: string
}

const DAYS_OF_WEEK = [
  { value: 0, label: "الأحد" },
  { value: 1, label: "الاثنين" },
  { value: 2, label: "الثلاثاء" },
  { value: 3, label: "الأربعاء" },
  { value: 4, label: "الخميس" },
  { value: 5, label: "الجمعة" },
  { value: 6, label: "السبت" }
]

export default function TaxRulesForm() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  
  const [taxRules, setTaxRules] = useState<TaxRule[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingRule, setEditingRule] = useState<TaxRule | null>(null)
  const [showForm, setShowForm] = useState(false)
  
  const [formData, setFormData] = useState<TaxRule>({
    name: "",
    description: "",
    tax_rate: 0,
    is_active: true,
    priority: 0,
    dining_type: "all",
    customer_type: "all"
  })

  const [tableInput, setTableInput] = useState("")
  const [excludeTableInput, setExcludeTableInput] = useState("")
  const [search, setSearch] = useState("")
  const [filterDiningType, setFilterDiningType] = useState<string>("all")
  const [filterCustomerType, setFilterCustomerType] = useState<string>("all")
  const [sortKey, setSortKey] = useState<keyof TaxRule>("priority")
  const [sortAsc, setSortAsc] = useState<boolean>(false)
  const [changeLog, setChangeLog] = useState<{time:string; action:string; ruleName:string}[]>([])
  const [canEdit, setCanEdit] = useState<boolean>(true)

  useEffect(() => {
    fetchTaxRules()
  }, [])
  
  useEffect(() => {
    // Check admin permission; fallback to true if check fails
    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setCanEdit(false); return }
        const { data } = await supabase.from("admin_users").select("id,is_active").eq("id", user.id).single()
        setCanEdit(!!data?.is_active)
      } catch {
        setCanEdit(true)
      }
    }
    checkAdmin()
  }, [])

  const fetchTaxRules = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/tax-rules")
      if (response.ok) {
        const data = await response.json()
        setTaxRules(data)
      } else {
        throw new Error("Failed to fetch tax rules")
      }
    } catch (error) {
      console.error("Error fetching tax rules:", error)
      toast({
        title: "خطأ",
        description: "فشل في تحميل قواعد الضرائب",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = editingRule ? `/api/tax-rules/${editingRule.id}` : "/api/tax-rules"
      const method = editingRule ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: "تم بنجاح",
          description: editingRule ? "تم تحديث قاعدة الضريبة" : "تم إنشاء قاعدة الضريبة",
        })
        resetForm()
        fetchTaxRules()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to save tax rule")
      }
    } catch (error) {
      console.error("Error saving tax rule:", error)
      toast({
        title: "خطأ",
        description: "فشل في حفظ قاعدة الضريبة",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه القاعدة؟")) return

    try {
      const response = await fetch(`/api/tax-rules/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast({
          title: "تم الحذف",
          description: "تم حذف قاعدة الضريبة بنجاح",
        })
        fetchTaxRules()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete tax rule")
      }
    } catch (error) {
      console.error("Error deleting tax rule:", error)
      toast({
        title: "خطأ",
        description: "فشل في حذف قاعدة الضريبة",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      tax_rate: 0,
      is_active: true,
      priority: 0,
      dining_type: "all",
      customer_type: "all"
    })
    setEditingRule(null)
    setShowForm(false)
    setTableInput("")
    setExcludeTableInput("")
  }

  const startEdit = (rule: TaxRule) => {
    setFormData(rule)
    setEditingRule(rule)
    setShowForm(true)
    setTableInput(rule.specific_tables?.join(", ") || "")
    setExcludeTableInput(rule.exclude_tables?.join(", ") || "")
  }

  const handleTableInputChange = (value: string, field: "specific_tables" | "exclude_tables") => {
    if (field === "specific_tables") {
      setTableInput(value)
      const tables = value.split(",").map(t => parseInt(t.trim())).filter(t => !isNaN(t))
      setFormData(prev => ({ ...prev, specific_tables: tables.length > 0 ? tables : undefined }))
    } else {
      setExcludeTableInput(value)
      const tables = value.split(",").map(t => parseInt(t.trim())).filter(t => !isNaN(t))
      setFormData(prev => ({ ...prev, exclude_tables: tables.length > 0 ? tables : undefined }))
    }
  }

  const toggleDay = (day: number) => {
    setFormData(prev => {
      const currentDays = prev.days_of_week || []
      const newDays = currentDays.includes(day)
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day].sort()
      return { ...prev, days_of_week: newDays.length > 0 ? newDays : undefined }
    })
  }

  const exportCSV = () => {
    const headers = ["name","tax_rate","dining_type","customer_type","time_start","is_active","priority","updated_at"]
    const rows = taxRules.map(r => [
      r.name,
      r.tax_rate,
      r.dining_type,
      r.customer_type,
      r.time_start || "",
      r.is_active ? "true" : "false",
      r.priority,
      r.updated_at || ""
    ])
    const csv = [headers.join(","), ...rows.map(row => row.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tax_rules_${new Date().toISOString()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportPDF = () => {
    const w = window.open("", "print", "width=800,height=600")
    if (!w) return
    const rows = taxRules.map(r => `<tr><td>${r.name}</td><td>${r.tax_rate}%</td><td>${r.dining_type}</td><td>${r.customer_type}</td><td>${r.time_start||""}</td><td>${r.is_active?"نشط":"غير نشط"}</td><td>${r.priority}</td><td>${r.updated_at||""}</td></tr>`).join("")
    w.document.write(`<!doctype html><html><head><title>Tax Rules</title><style>table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5}</style></head><body><h3>قواعد الضرائب</h3><table><thead><tr><th>الاسم</th><th>النسبة</th><th>نوع الطلب</th><th>نوع العميل</th><th>تاريخ السريان</th><th>الحالة</th><th>الأولوية</th><th>آخر تحديث</th></tr></thead><tbody>${rows}</tbody></table></body></html>`)
    w.document.close()
    w.focus()
    w.print()
    w.close()
  }

  const statusLabel = (r: TaxRule) => {
    const now = new Date()
    const start = r.time_start ? new Date(`${new Date().toISOString().split('T')[0]}T${r.time_start}:00`) : null
    if (!r.is_active) return { text: "غير نشط", variant: "secondary" as const }
    if (start && start > now) return { text: "معلق", variant: "outline" as const }
    return { text: "نشط", variant: "default" as const }
  }

  const updateRule = async (id: string, patch: Partial<TaxRule>) => {
    const existing = taxRules.find(r => r.id === id)
    if (!existing) return
    const payload: TaxRule = { ...existing, ...patch }
    try {
      const resp = await fetch(`/api/tax-rules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      if (resp.ok) {
        const updated = await resp.json()
        setTaxRules(prev => prev.map(r => r.id === id ? updated : r))
        setChangeLog(prev => [{ time: new Date().toISOString(), action: "تحديث", ruleName: payload.name }, ...prev])
      } else {
        const err = await resp.json()
        toast({ title: "خطأ", description: err.error || "فشل في حفظ التعديل", variant: "destructive" })
      }
    } catch (e) {
      toast({ title: "خطأ", description: "فشل الاتصال بالخادم", variant: "destructive" })
    }
  }

  const filteredRules = taxRules
    .filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
    .filter(r => filterDiningType === "all" ? true : r.dining_type === filterDiningType)
    .filter(r => filterCustomerType === "all" ? true : r.customer_type === filterCustomerType)
    .sort((a,b) => {
      const av = (a[sortKey] as any) ?? ""
      const bv = (b[sortKey] as any) ?? ""
      if (av < bv) return sortAsc ? -1 : 1
      if (av > bv) return sortAsc ? 1 : -1
      return 0
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">إدارة قواعد الضرائب</h2>
          <p className="text-muted-foreground">إنشاء وإدارة قواعد الضرائب المشروطة</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة قاعدة جديدة
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingRule ? "تعديل قاعدة الضريبة" : "إضافة قاعدة ضريبة جديدة"}</CardTitle>
            <CardDescription>
              قم بتحديد الشروط التي تحدد متى يتم تطبيق هذه الضريبة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم القاعدة *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="مثل: ضريبة القيمة المضافة"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax_rate">نسبة الضريبة (%) *</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.tax_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="وصف مفصل لقاعدة الضريبة"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">الأولوية</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="0"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                  <p className="text-sm text-muted-foreground">القواعد ذات الأولوية الأعلى يتم تطبيقها أولاً</p>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">نشط</Label>
                </div>
              </div>

              <Separator />

              {/* Conditions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">الشروط</h3>
                
                {/* Order Amount Conditions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_order_amount">الحد الأدنى لقيمة الطلب (ر.س)</Label>
                    <Input
                      id="min_order_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.min_order_amount || ""}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        min_order_amount: e.target.value ? parseFloat(e.target.value) : undefined 
                      }))}
                      placeholder="اتركه فارغاً لعدم التحديد"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_order_amount">الحد الأقصى لقيمة الطلب (ر.س)</Label>
                    <Input
                      id="max_order_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.max_order_amount || ""}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        max_order_amount: e.target.value ? parseFloat(e.target.value) : undefined 
                      }))}
                      placeholder="اتركه فارغاً لعدم التحديد"
                    />
                  </div>
                </div>

                {/* Dining Type and Customer Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>نوع الطلب</Label>
                    <Select
                      value={formData.dining_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, dining_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع الأنواع</SelectItem>
                        <SelectItem value="dine_in">تناول في المطعم</SelectItem>
                        <SelectItem value="takeaway">طلب خارجي</SelectItem>
                        <SelectItem value="reservation">حجز</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>نوع العميل</Label>
                    <Select
                      value={formData.customer_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, customer_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع العملاء</SelectItem>
                        <SelectItem value="regular">عميل عادي</SelectItem>
                        <SelectItem value="vip">عميل مميز</SelectItem>
                        <SelectItem value="staff">موظف</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Table Conditions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="specific_tables">طاولات محددة</Label>
                    <Input
                      id="specific_tables"
                      value={tableInput}
                      onChange={(e) => handleTableInputChange(e.target.value, "specific_tables")}
                      placeholder="1, 2, 3 (اتركه فارغاً لجميع الطاولات)"
                    />
                    <p className="text-sm text-muted-foreground">أرقام الطاولات مفصولة بفواصل</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exclude_tables">استثناء طاولات</Label>
                    <Input
                      id="exclude_tables"
                      value={excludeTableInput}
                      onChange={(e) => handleTableInputChange(e.target.value, "exclude_tables")}
                      placeholder="5, 6, 7"
                    />
                    <p className="text-sm text-muted-foreground">طاولات لا تطبق عليها هذه الضريبة</p>
                  </div>
                </div>

                {/* Time Conditions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="time_start">وقت البداية</Label>
                    <Input
                      id="time_start"
                      type="time"
                      value={formData.time_start || ""}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        time_start: e.target.value || undefined 
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time_end">وقت النهاية</Label>
                    <Input
                      id="time_end"
                      type="time"
                      value={formData.time_end || ""}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        time_end: e.target.value || undefined 
                      }))}
                    />
                  </div>
                </div>

                {/* Days of Week */}
                <div className="space-y-2">
                  <Label>أيام الأسبوع</Label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <Badge
                        key={day.value}
                        variant={formData.days_of_week?.includes(day.value) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleDay(day.value)}
                      >
                        {day.label}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formData.days_of_week?.length ? 
                      `مختار: ${formData.days_of_week.length} أيام` : 
                      "جميع أيام الأسبوع (لم يتم تحديد أيام)"
                    }
                  </p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isLoading} className="gap-2">
                  <Save className="h-4 w-4" />
                  {isLoading ? "جاري الحفظ..." : (editingRule ? "تحديث" : "إنشاء")}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="gap-2">
                  <X className="h-4 w-4" />
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tax Rules List */}
      <Card>
        <CardHeader>
          <CardTitle>قواعد الضرائب الحالية ({taxRules.length})</CardTitle>
          <CardDescription>إدارة سريعة بواجهة جدول مع فرز وتصفية وتعديل تلقائي</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4 items-center">
            <Input placeholder="بحث بالاسم" value={search} onChange={(e)=>setSearch(e.target.value)} className="max-w-xs" />
            <Select value={filterDiningType} onValueChange={setFilterDiningType}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="نوع الطلب" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="dine_in">تناول في المطعم</SelectItem>
                <SelectItem value="takeaway">طلب خارجي</SelectItem>
                <SelectItem value="reservation">حجز</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCustomerType} onValueChange={setFilterCustomerType}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="نوع العميل" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع العملاء</SelectItem>
                <SelectItem value="regular">عادي</SelectItem>
                <SelectItem value="vip">مميز</SelectItem>
                <SelectItem value="staff">موظف</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={()=>{setSortKey("priority"); setSortAsc(!sortAsc)}}>فرز حسب الأولوية</Button>
            <div className="ms-auto flex gap-2">
              <Button variant="outline" onClick={exportCSV} className="gap-2"><Download className="h-4 w-4" /> تصدير CSV</Button>
              <Button variant="outline" onClick={exportPDF} className="gap-2"><Printer className="h-4 w-4" /> تصدير PDF</Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : filteredRules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">لا توجد نتائج للتصفية الحالية</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>النسبة (%)</TableHead>
                  <TableHead>نوع الطلب</TableHead>
                  <TableHead>نوع العميل</TableHead>
                  <TableHead>تاريخ السريان</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الأولوية</TableHead>
                  <TableHead>آخر تحديث</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRules.map((rule) => {
                  const st = statusLabel(rule)
                  return (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <Input defaultValue={rule.name} disabled={!canEdit} onBlur={(e)=> rule.id && updateRule(rule.id, { name: e.target.value })} />
                      </TableCell>
                      <TableCell>
                        <Input type="number" step="0.01" min="0" max="100" defaultValue={rule.tax_rate} disabled={!canEdit} onBlur={(e)=> rule.id && updateRule(rule.id, { tax_rate: parseFloat(e.target.value)||0 })} />
                      </TableCell>
                      <TableCell>
                        <Select defaultValue={rule.dining_type} onValueChange={(v)=> rule.id && updateRule(rule.id, { dining_type: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">جميع الأنواع</SelectItem>
                            <SelectItem value="dine_in">تناول في المطعم</SelectItem>
                            <SelectItem value="takeaway">طلب خارجي</SelectItem>
                            <SelectItem value="reservation">حجز</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select defaultValue={rule.customer_type} onValueChange={(v)=> rule.id && updateRule(rule.id, { customer_type: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">جميع العملاء</SelectItem>
                            <SelectItem value="regular">عادي</SelectItem>
                            <SelectItem value="vip">مميز</SelectItem>
                            <SelectItem value="staff">موظف</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input type="time" defaultValue={rule.time_start || ""} onBlur={(e)=> rule.id && updateRule(rule.id, { time_start: e.target.value || undefined })} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={st.variant}>{st.text}</Badge>
                          <Switch checked={rule.is_active} onCheckedChange={(v)=> rule.id && updateRule(rule.id, { is_active: v })} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input type="number" min="0" defaultValue={rule.priority} onBlur={(e)=> rule.id && updateRule(rule.id, { priority: parseInt(e.target.value)||0 })} />
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{rule.updated_at ? new Date(rule.updated_at).toLocaleString() : "—"}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => startEdit(rule)} disabled={!canEdit}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="outline" onClick={() => rule.id && handleDelete(rule.id)} className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}

          {/* Audit log in session */}
          {changeLog.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-2">سجل التعديلات (جلسة العمل)</h4>
              <ul className="text-sm space-y-1">
                {changeLog.map((l,idx)=> (
                  <li key={idx} className="text-muted-foreground">{new Date(l.time).toLocaleString()} — {l.action}: {l.ruleName}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}