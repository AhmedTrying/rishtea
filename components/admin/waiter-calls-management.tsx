"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { 
  Bell, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Eye, 
  MessageSquare,
  Phone,
  User,
  Trash2,
  Filter,
  Calendar
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"

interface WaiterCall {
  id: string
  table_number: number
  customer_name?: string
  phone_number?: string
  request_type: string
  message?: string
  status: string
  priority: string
  created_at: string
  acknowledged_at?: string
  completed_at?: string
  acknowledged_by?: string
  completed_by?: string
  notes?: string
  minutes_waiting?: number
}

interface WaiterCallStats {
  total: number
  pending: number
  acknowledged: number
  in_progress: number
  completed: number
  cancelled: number
  averageResponseTime: number
}

export default function WaiterCallsManagement() {
  const [calls, setCalls] = useState<WaiterCall[]>([])
  const [activeCalls, setActiveCalls] = useState<WaiterCall[]>([])
  const [stats, setStats] = useState<WaiterCallStats>({
    total: 0,
    pending: 0,
    acknowledged: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
    averageResponseTime: 0
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedCall, setSelectedCall] = useState<WaiterCall | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [tableFilter, setTableFilter] = useState<string>('')

  const { toast } = useToast()
  const supabase = createClient()

  const requestTypes = {
    general: { label: 'طلب عام', icon: Bell, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    order: { label: 'طلب إضافي', icon: MessageSquare, color: 'bg-green-50 text-green-700 border-green-200' },
    bill: { label: 'طلب الحساب', icon: CheckCircle, color: 'bg-purple-50 text-purple-700 border-purple-200' },
    assistance: { label: 'طلب مساعدة', icon: User, color: 'bg-orange-50 text-orange-700 border-orange-200' },
    complaint: { label: 'شكوى', icon: Phone, color: 'bg-red-50 text-red-700 border-red-200' }
  }

  const priorities = {
    low: { label: 'منخفضة', color: 'bg-gray-50 text-gray-700 border-gray-200' },
    normal: { label: 'عادي', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    high: { label: 'مهم', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    urgent: { label: 'عاجل', color: 'bg-red-50 text-red-700 border-red-200' }
  }

  const statuses = {
    pending: { label: 'قيد الانتظار', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock },
    acknowledged: { label: 'تم الاستلام', color: 'bg-blue-100 text-blue-800', icon: Eye },
    in_progress: { label: 'قيد التنفيذ', color: 'bg-purple-100 text-purple-800', icon: RefreshCw },
    completed: { label: 'مكتمل', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-800', icon: XCircle }
  }

  const fetchCalls = async () => {
    try {
      const { data, error } = await supabase
        .from('waiter_calls')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setCalls(data || [])
      
      // Calculate stats
      const totalCalls = data?.length || 0
      const pendingCalls = data?.filter(call => call.status === 'pending').length || 0
      const acknowledgedCalls = data?.filter(call => call.status === 'acknowledged').length || 0
      const inProgressCalls = data?.filter(call => call.status === 'in_progress').length || 0
      const completedCalls = data?.filter(call => call.status === 'completed').length || 0
      const cancelledCalls = data?.filter(call => call.status === 'cancelled').length || 0

      setStats({
        total: totalCalls,
        pending: pendingCalls,
        acknowledged: acknowledgedCalls,
        in_progress: inProgressCalls,
        completed: completedCalls,
        cancelled: cancelledCalls,
        averageResponseTime: 0 // Calculate this based on your needs
      })

    } catch (error) {
      console.error('Error fetching waiter calls:', error)
      toast({
        title: "خطأ في تحميل البيانات",
        description: "فشل في تحميل طلبات النادل",
        variant: "destructive"
      })
    }
  }

  const fetchActiveCalls = async () => {
    try {
      const { data, error } = await supabase
        .from('active_waiter_calls')
        .select('*')

      if (error) throw error
      setActiveCalls(data || [])
    } catch (error) {
      console.error('Error fetching active calls:', error)
    }
  }

  const updateCallStatus = async (callId: string, newStatus: string, notes?: string) => {
    try {
      const updateData: any = { 
        id: callId, 
        status: newStatus 
      }
      
      if (notes) {
        updateData.notes = notes
      }

      const response = await fetch('/api/waiter-calls', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        throw new Error('فشل في تحديث حالة الطلب')
      }

      toast({
        title: "تم التحديث بنجاح",
        description: `تم تحديث حالة الطلب إلى ${statuses[newStatus as keyof typeof statuses]?.label}`,
      })

      await fetchCalls()
      await fetchActiveCalls()
      setSelectedCall(null)

    } catch (error) {
      console.error('Error updating call status:', error)
      toast({
        title: "خطأ في التحديث",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive"
      })
    }
  }

  const deleteCall = async (callId: string) => {
    try {
      const response = await fetch(`/api/waiter-calls?id=${callId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('فشل في حذف الطلب')
      }

      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف طلب النادل",
      })

      await fetchCalls()
      await fetchActiveCalls()

    } catch (error) {
      console.error('Error deleting call:', error)
      toast({
        title: "خطأ في الحذف",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive"
      })
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchCalls(), fetchActiveCalls()])
    setRefreshing(false)
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchCalls(), fetchActiveCalls()])
      setLoading(false)
    }

    loadData()

    // Set up real-time subscription
    const subscription = supabase
      .channel('waiter_calls_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'waiter_calls' },
        () => {
          fetchCalls()
          fetchActiveCalls()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const filteredCalls = calls.filter(call => {
    if (statusFilter !== 'all' && call.status !== statusFilter) return false
    if (priorityFilter !== 'all' && call.priority !== priorityFilter) return false
    if (tableFilter && !call.table_number.toString().includes(tableFilter)) return false
    return true
  })

  const CallDetailsDialog = ({ call }: { call: WaiterCall }) => {
    const [notes, setNotes] = useState(call.notes || '')
    const [newStatus, setNewStatus] = useState(call.status)

    return (
      <>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              تفاصيل طلب النادل - طاولة {call.table_number}
            </DialogTitle>
            <DialogDescription>
              تم الإنشاء {formatDistanceToNow(new Date(call.created_at), { addSuffix: true, locale: ar })}
            </DialogDescription>
          </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>نوع الطلب</Label>
              <div className="flex items-center gap-2 mt-1">
                {requestTypes[call.request_type as keyof typeof requestTypes] && (
                  <>
                    {(() => {
                      const IconComponent = requestTypes[call.request_type as keyof typeof requestTypes].icon;
                      return <IconComponent className="h-4 w-4" />;
                    })()}
                    <Badge className={requestTypes[call.request_type as keyof typeof requestTypes].color}>
                      {requestTypes[call.request_type as keyof typeof requestTypes].label}
                    </Badge>
                  </>
                )}
              </div>
            </div>

            <div>
              <Label>الأولوية</Label>
              <Badge className={`mt-1 ${priorities[call.priority as keyof typeof priorities]?.color}`}>
                {priorities[call.priority as keyof typeof priorities]?.label}
              </Badge>
            </div>
          </div>

          {call.customer_name && (
            <div>
              <Label>اسم العميل</Label>
              <p className="mt-1">{call.customer_name}</p>
            </div>
          )}

          {call.phone_number && (
            <div>
              <Label>رقم الهاتف</Label>
              <p className="mt-1">{call.phone_number}</p>
            </div>
          )}

          {call.message && (
            <div>
              <Label>الرسالة</Label>
              <p className="mt-1 p-3 bg-gray-50 rounded-lg">{call.message}</p>
            </div>
          )}

          <div>
            <Label htmlFor="status">تحديث الحالة</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statuses).map(([key, status]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const IconComponent = status.icon;
                        return <IconComponent className="h-4 w-4" />;
                      })()}
                      {status.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أضف ملاحظات..."
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setSelectedCall(null)}>
            إلغاء
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => deleteCall(call.id)}
          >
            <Trash2 className="ml-2 h-4 w-4" />
            حذف
          </Button>
          <Button 
            onClick={() => updateCallStatus(call.id, newStatus, notes)}
            disabled={newStatus === call.status && notes === call.notes}
          >
            <CheckCircle className="ml-2 h-4 w-4" />
            تحديث
          </Button>
        </DialogFooter>
        </DialogContent>
      </>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="mr-2">جاري التحميل...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">إدارة طلبات النادل</h2>
          <p className="text-muted-foreground mt-1">متابعة والرد على طلبات العملاء</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`ml-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">المجموع</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">قيد الانتظار</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">تم الاستلام</p>
                <p className="text-2xl font-bold text-blue-600">{stats.acknowledged}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">قيد التنفيذ</p>
                <p className="text-2xl font-bold text-purple-600">{stats.in_progress}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">مكتمل</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ملغي</p>
                <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">الطلبات النشطة ({activeCalls.length})</TabsTrigger>
          <TabsTrigger value="all">جميع الطلبات ({calls.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeCalls.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">لا توجد طلبات نشطة</h3>
                <p className="text-muted-foreground">جميع طلبات النادل تم التعامل معها</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeCalls.map((call) => {
                const requestType = requestTypes[call.request_type as keyof typeof requestTypes]
                const priority = priorities[call.priority as keyof typeof priorities]
                const status = statuses[call.status as keyof typeof statuses]
                
                return (
                  <Card key={call.id} className="border-l-4 border-l-yellow-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold">طاولة {call.table_number}</div>
                            {call.minutes_waiting && (
                              <div className="text-sm text-muted-foreground">
                                {Math.round(call.minutes_waiting)} دقيقة
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {requestType && (() => {
                                const IconComponent = requestType.icon;
                                return <IconComponent className="h-4 w-4" />;
                              })()}
                              <Badge className={requestType?.color}>
                                {requestType?.label}
                              </Badge>
                              <Badge className={priority?.color}>
                                {priority?.label}
                              </Badge>
                            </div>
                            
                            {call.customer_name && (
                              <p className="text-sm font-medium">{call.customer_name}</p>
                            )}
                            
                            {call.message && (
                              <p className="text-sm text-muted-foreground">{call.message}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge className={status?.color}>
                            {status && (() => {
                              const IconComponent = status.icon;
                              return <IconComponent className="ml-1 h-3 w-3" />;
                            })()}
                            {status?.label}
                          </Badge>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCall(call)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {call.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => updateCallStatus(call.id, 'acknowledged')}
                            >
                              استلام
                            </Button>
                          )}
                          
                          {call.status === 'acknowledged' && (
                            <Button
                              size="sm"
                              onClick={() => updateCallStatus(call.id, 'in_progress')}
                            >
                              بدء التنفيذ
                            </Button>
                          )}
                          
                          {call.status === 'in_progress' && (
                            <Button
                              size="sm"
                              onClick={() => updateCallStatus(call.id, 'completed')}
                            >
                              إكمال
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                تصفية النتائج
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>الحالة</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      {Object.entries(statuses).map(([key, status]) => (
                        <SelectItem key={key} value={key}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>الأولوية</Label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأولويات</SelectItem>
                      {Object.entries(priorities).map(([key, priority]) => (
                        <SelectItem key={key} value={key}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>رقم الطاولة</Label>
                  <Input
                    type="number"
                    placeholder="البحث برقم الطاولة"
                    value={tableFilter}
                    onChange={(e) => setTableFilter(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* All Calls Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الطاولة</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>نوع الطلب</TableHead>
                    <TableHead>الأولوية</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>التوقيت</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCalls.map((call) => {
                    const requestType = requestTypes[call.request_type as keyof typeof requestTypes]
                    const priority = priorities[call.priority as keyof typeof priorities]
                    const status = statuses[call.status as keyof typeof statuses]
                    
                    return (
                      <TableRow key={call.id}>
                        <TableCell className="font-medium">
                          طاولة {call.table_number}
                        </TableCell>
                        <TableCell>
                          {call.customer_name || 'غير محدد'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {requestType && (() => {
                              const IconComponent = requestType.icon;
                              return <IconComponent className="h-4 w-4" />;
                            })()}
                            <Badge className={requestType?.color}>
                              {requestType?.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={priority?.color}>
                            {priority?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={status?.color}>
                            {status && (() => {
                              const IconComponent = status.icon;
                              return <IconComponent className="ml-1 h-3 w-3" />;
                            })()}
                            {status?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(call.created_at), { 
                            addSuffix: true, 
                            locale: ar 
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedCall(call)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteCall(call.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Call Details Dialog */}
      {selectedCall && (
        <Dialog open={!!selectedCall} onOpenChange={() => setSelectedCall(null)}>
          <CallDetailsDialog call={selectedCall} />
        </Dialog>
      )}
    </div>
  )
}