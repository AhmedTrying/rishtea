"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Loader2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Table {
  id: string
  number: number
  zone: string
  capacity: number
  status: 'available' | 'occupied' | 'reserved' | 'maintenance'
  is_available: boolean
  created_at: string
  updated_at: string
}

interface NewTable {
  number: number
  zone: string
  capacity: number
  status: string
}

export default function TableManagement() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [newTable, setNewTable] = useState<NewTable>({
    number: 0,
    zone: 'main',
    capacity: 4,
    status: 'available'
  })
  const { toast } = useToast()

  const fetchTables = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    
    try {
      const response = await fetch('/api/tables')
      if (!response.ok) throw new Error('Failed to fetch tables')
      
      const data = await response.json()
      setTables(data)
    } catch (error) {
      console.error('Error fetching tables:', error)
      toast({
        title: "خطأ",
        description: "فشل في تحميل الطاولات",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      if (showRefreshing) setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchTables()
  }, [])

  const saveTable = async () => {
    if (!newTable.number || newTable.capacity <= 0) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const url = editingTable ? '/api/tables' : '/api/tables'
      const method = editingTable ? 'PUT' : 'POST'
      const body = editingTable 
        ? { ...newTable, id: editingTable.id }
        : newTable

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save table')
      }

      toast({
        title: "نجح",
        description: editingTable ? "تم تحديث الطاولة بنجاح" : "تم إضافة الطاولة بنجاح",
      })

      setNewTable({ number: 0, zone: 'main', capacity: 4, status: 'available' })
      setEditingTable(null)
      fetchTables()
    } catch (error: any) {
      console.error('Error saving table:', error)
      toast({
        title: "خطأ",
        description: error.message || "فشل في حفظ الطاولة",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const deleteTable = async (tableId: string) => {
    try {
      const response = await fetch(`/api/tables?id=${tableId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete table')
      }

      toast({
        title: "نجح",
        description: "تم حذف الطاولة بنجاح",
      })

      fetchTables()
    } catch (error: any) {
      console.error('Error deleting table:', error)
      toast({
        title: "خطأ",
        description: error.message || "فشل في حذف الطاولة",
        variant: "destructive",
      })
    }
  }

  const updateTableStatus = async (tableId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/tables/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableId,
          status: newStatus,
          is_available: newStatus === 'available'
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update table status')
      }

      toast({
        title: "نجح",
        description: "تم تحديث حالة الطاولة بنجاح",
      })

      fetchTables()
    } catch (error: any) {
      console.error('Error updating table status:', error)
      toast({
        title: "خطأ",
        description: error.message || "فشل في تحديث حالة الطاولة",
        variant: "destructive",
      })
    }
  }

  const startEdit = (table: Table) => {
    setEditingTable(table)
    setNewTable({
      number: table.number,
      zone: table.zone,
      capacity: table.capacity,
      status: table.status
    })
  }

  const cancelEdit = () => {
    setEditingTable(null)
    setNewTable({ number: 0, zone: 'main', capacity: 4, status: 'available' })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500'
      case 'occupied':
        return 'bg-red-500'
      case 'reserved':
        return 'bg-yellow-500'
      case 'maintenance':
        return 'bg-gray-500'
      default:
        return 'bg-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'متاحة'
      case 'occupied':
        return 'مشغولة'
      case 'reserved':
        return 'محجوزة'
      case 'maintenance':
        return 'صيانة'
      default:
        return 'غير معروف'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4" />
      case 'occupied':
        return <XCircle className="w-4 h-4" />
      case 'reserved':
        return <Clock className="w-4 h-4" />
      case 'maintenance':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة الطاولات</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchTables(true)}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Table Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {editingTable ? "تعديل الطاولة" : "إضافة طاولة جديدة"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tableNumber">رقم الطاولة *</Label>
              <Input
                id="tableNumber"
                type="number"
                min="1"
                value={newTable.number || ''}
                onChange={(e) => setNewTable({ ...newTable, number: parseInt(e.target.value) || 0 })}
                placeholder="1"
              />
            </div>

            <div>
              <Label htmlFor="zone">المنطقة</Label>
              <Select value={newTable.zone} onValueChange={(value) => setNewTable({ ...newTable, zone: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المنطقة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">الرئيسية</SelectItem>
                  <SelectItem value="outdoor">خارجية</SelectItem>
                  <SelectItem value="vip">كبار الشخصيات</SelectItem>
                  <SelectItem value="family">عائلية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="capacity">السعة *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={newTable.capacity || ''}
                onChange={(e) => setNewTable({ ...newTable, capacity: parseInt(e.target.value) || 0 })}
                placeholder="4"
              />
            </div>

            <div>
              <Label htmlFor="status">الحالة</Label>
              <Select value={newTable.status} onValueChange={(value) => setNewTable({ ...newTable, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">متاحة</SelectItem>
                  <SelectItem value="occupied">مشغولة</SelectItem>
                  <SelectItem value="reserved">محجوزة</SelectItem>
                  <SelectItem value="maintenance">صيانة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                onClick={saveTable}
                disabled={saving}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingTable ? "تحديث" : "إضافة"} الطاولة
                  </>
                )}
              </Button>
              {editingTable && (
                <Button onClick={cancelEdit} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  إلغاء
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tables List */}
        <Card>
          <CardHeader>
            <CardTitle>الطاولات الحالية ({tables.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {tables.map((table) => (
                  <div
                    key={table.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">طاولة {table.number}</h3>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(table.status)}
                        <Badge className={`${getStatusColor(table.status)} text-white`}>
                          {getStatusText(table.status)}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">المنطقة: {table.zone}</p>
                    <p className="text-sm text-muted-foreground mb-3">السعة: {table.capacity} أشخاص</p>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(table)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Select onValueChange={(value) => updateTableStatus(table.id, value)}>
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue placeholder="تغيير الحالة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">متاحة</SelectItem>
                          <SelectItem value="occupied">مشغولة</SelectItem>
                          <SelectItem value="reserved">محجوزة</SelectItem>
                          <SelectItem value="maintenance">صيانة</SelectItem>
                        </SelectContent>
                      </Select>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                            <AlertDialogDescription>
                              سيتم حذف الطاولة {table.number} نهائياً. هذا الإجراء لا يمكن التراجع عنه.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteTable(table.id)}>
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
                
                {tables.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد طاولات مضافة بعد
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}