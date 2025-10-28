"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Save, Search, Plus, Loader2 } from "lucide-react"

interface Customer {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  loyalty_points?: number
  total_orders?: number
  total_spent?: number
  min_order_amount?: number | null
}

export default function CustomerManagement() {
  const supabase = createClient()
  const { toast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    min_order_amount: ""
  })
  const [creating, setCreating] = useState(false)

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from("customers")
        .select("id, name, email, phone, loyalty_points, total_orders, total_spent, min_order_amount")
        .order("created_at", { ascending: false })
        .limit(20)

      if (search.trim()) {
        query = query.or(
          `name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`
        )
      }

      const { data, error } = await query
      if (error) throw error
      setCustomers(data || [])
    } catch (err: any) {
      console.error("Error fetching customers:", err)
      toast({ title: "فشل التحميل", description: "تعذر جلب العملاء", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateMinOrder = async (id: string, amount: number | null) => {
    setSavingId(id)
    try {
      const { error } = await supabase
        .from("customers")
        .update({ min_order_amount: amount })
        .eq("id", id)

      if (error) throw error
      toast({ title: "تم الحفظ", description: "تم تحديث الحد الأدنى للطلب" })
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, min_order_amount: amount ?? null } : c))
    } catch (err: any) {
      console.error("Error updating min order:", err)
      toast({ title: "فشل الحفظ", description: "تعذر تحديث الحد الأدنى", variant: "destructive" })
    } finally {
      setSavingId(null)
    }
  }

  const createCustomer = async () => {
    if (!newCustomer.name.trim() || (!newCustomer.phone && !newCustomer.email)) {
      toast({ title: "بيانات ناقصة", description: "الاسم ورقم الجوال أو البريد مطلوبان", variant: "destructive" })
      return
    }
    setCreating(true)
    try {
      const minAmount = newCustomer.min_order_amount ? parseFloat(newCustomer.min_order_amount) : null
      const { data, error } = await supabase
        .from("customers")
        .insert({
          name: newCustomer.name.trim(),
          phone: newCustomer.phone || null,
          email: newCustomer.email || null,
          min_order_amount: minAmount ?? null
        })
        .select()

      if (error) throw error
      toast({ title: "تم الإنشاء", description: "تم إضافة عميل جديد" })
      setNewCustomer({ name: "", phone: "", email: "", min_order_amount: "" })
      // Prepend new customer to list
      if (data && data.length > 0) {
        setCustomers(prev => [
          ...data.map((c: any) => ({
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            loyalty_points: c.loyalty_points,
            total_orders: c.total_orders,
            total_spent: c.total_spent,
            min_order_amount: c.min_order_amount
          })),
          ...prev
        ])
      }
    } catch (err: any) {
      console.error("Error creating customer:", err)
      toast({ title: "فشل الإنشاء", description: "تعذر إضافة العميل", variant: "destructive" })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>البحث عن العملاء</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="search">بحث بالاسم/الجوال/البريد</Label>
              <Input id="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="اكتب للبحث" />
            </div>
            <Button onClick={fetchCustomers} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Search className="w-4 h-4 ml-2" />}
              بحث
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>إضافة عميل جديد</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>الاسم</Label>
            <Input value={newCustomer.name} onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>رقم الجوال</Label>
            <Input value={newCustomer.phone} onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))} inputMode="tel" />
          </div>
          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input value={newCustomer.email} onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>الحد الأدنى للطلب (ر.س)</Label>
            <Input type="number" step="0.01" value={newCustomer.min_order_amount} onChange={(e) => setNewCustomer(prev => ({ ...prev, min_order_amount: e.target.value }))} />
          </div>
          <div className="md:col-span-4 flex justify-end">
            <Button onClick={createCustomer} disabled={creating}>
              {creating ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Plus className="w-4 h-4 ml-2" />}
              إضافة
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>قائمة العملاء</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">الجوال</TableHead>
                <TableHead className="text-right">البريد</TableHead>
                <TableHead className="text-right">الحد الأدنى للطلب (ر.س)</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">لا يوجد عملاء</TableCell>
                </TableRow>
              ) : customers.map(c => (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.phone ?? "—"}</TableCell>
                  <TableCell>{c.email ?? "—"}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      defaultValue={c.min_order_amount ?? ""}
                      onChange={(e) => setCustomers(prev => prev.map(x => x.id === c.id ? { ...x, min_order_amount: e.target.value ? parseFloat(e.target.value) : null } : x))}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => updateMinOrder(c.id, c.min_order_amount ?? null)} disabled={savingId === c.id}>
                      {savingId === c.id ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
                      حفظ
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}