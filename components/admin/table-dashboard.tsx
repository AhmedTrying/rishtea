"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Clock, Users, DollarSign, AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TableStatus {
  table_number: number
  status: string
  is_available: boolean
  current_order_id: string | null
  order_total: number | null
  order_status: string | null
  time_occupied: string | null
  zone: string
  capacity: number
}

export default function TableDashboard() {
  const [tables, setTables] = useState<TableStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const { toast } = useToast()
  const supabase = createClient()

  const fetchTableStatus = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    
    try {
      const { data, error } = await supabase
        .from('table_dashboard')
        .select('*')
        .order('table_number')

      if (error) throw error
      setTables(data || [])
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Error fetching table status:', error)
      toast({
        title: "خطأ",
        description: "فشل في تحميل حالة الطاولات",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      if (showRefreshing) setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchTableStatus()
    const interval = setInterval(() => fetchTableStatus(), 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

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

  const updateTableStatus = async (tableNumber: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tables')
        .update({ 
          status: newStatus,
          is_available: newStatus === 'available',
          updated_at: new Date().toISOString()
        })
        .eq('number', tableNumber)

      if (error) throw error
      
      toast({
        title: "نجح",
        description: `تم تحديث حالة الطاولة ${tableNumber}`,
      })
      
      fetchTableStatus()
    } catch (error) {
      console.error('Error updating table status:', error)
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة الطاولة",
        variant: "destructive",
      })
    }
  }

  const availableTables = tables.filter(t => t.status === 'available').length
  const occupiedTables = tables.filter(t => t.status === 'occupied').length
  const reservedTables = tables.filter(t => t.status === 'reserved').length
  const maintenanceTables = tables.filter(t => t.status === 'maintenance').length

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">لوحة تحكم الطاولات</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            آخر تحديث: {lastRefresh.toLocaleTimeString('ar-SA')}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchTableStatus(true)}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">متاحة</p>
                <p className="text-2xl font-bold text-green-600">{availableTables}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">مشغولة</p>
                <p className="text-2xl font-bold text-red-600">{occupiedTables}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">محجوزة</p>
                <p className="text-2xl font-bold text-yellow-600">{reservedTables}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">صيانة</p>
                <p className="text-2xl font-bold text-gray-600">{maintenanceTables}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table) => (
          <Card key={table.table_number} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">طاولة {table.table_number}</CardTitle>
                <Badge 
                  variant="secondary" 
                  className={`${getStatusColor(table.status)} text-white`}
                >
                  <div className="flex items-center gap-1">
                    {getStatusIcon(table.status)}
                    {getStatusText(table.status)}
                  </div>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>السعة: {table.capacity} أشخاص</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>المنطقة: {table.zone}</span>
              </div>

              {table.current_order_id && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4" />
                    <span>المبلغ: {table.order_total?.toFixed(2)} ريال</span>
                  </div>

                  {table.time_occupied && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>المدة: {table.time_occupied}</span>
                    </div>
                  )}

                  <Badge variant="outline" className="w-fit">
                    حالة الطلب: {
                      table.order_status === 'pending' ? 'في الانتظار' :
                      table.order_status === 'preparing' ? 'قيد التحضير' :
                      table.order_status === 'ready' ? 'جاهز' :
                      table.order_status === 'completed' ? 'مكتمل' :
                      table.order_status
                    }
                  </Badge>
                </>
              )}

              <div className="flex gap-2 pt-2">
                {table.status !== 'available' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateTableStatus(table.table_number, 'available')}
                    className="flex-1"
                  >
                    تحرير
                  </Button>
                )}
                
                {table.status === 'available' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateTableStatus(table.table_number, 'occupied')}
                      className="flex-1"
                    >
                      إشغال
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateTableStatus(table.table_number, 'reserved')}
                      className="flex-1"
                    >
                      حجز
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tables.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">لا توجد طاولات مضافة بعد</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}