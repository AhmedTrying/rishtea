"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Bell, Phone, User, MessageSquare, Clock, CheckCircle, Utensils, Receipt } from "lucide-react"

interface CallWaiterProps {
  tableNumber?: number
  className?: string
}

interface WaiterCallData {
  table_number: number
  request_type: string
  message?: string
}

export default function CallWaiter({ tableNumber, className }: CallWaiterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState<WaiterCallData>({
    table_number: tableNumber || 0,
    request_type: 'general',
    message: ''
  })

  const { toast } = useToast()

  const requestTypes = [
    { value: 'general', label: 'طلب عام', icon: Bell, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { value: 'order', label: 'طلب إضافي', icon: Utensils, color: 'bg-green-50 text-green-700 border-green-200' },
    { value: 'bill', label: 'طلب الحساب', icon: Receipt, color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { value: 'assistance', label: 'طلب مساعدة', icon: User, color: 'bg-orange-50 text-orange-700 border-orange-200' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.table_number || formData.table_number <= 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رقم طاولة صحيح",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/waiter-calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'فشل في إرسال الطلب')
      }

      setIsSuccess(true)
      toast({
        title: "تم إرسال الطلب بنجاح",
        description: "سيصل النادل إليكم قريباً",
      })

      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSuccess(false)
        setIsOpen(false)
        setFormData({
          table_number: tableNumber || 0,
          request_type: 'general',
          message: ''
        })
      }, 3000)

    } catch (error) {
      console.error('Error calling waiter:', error)
      toast({
        title: "خطأ في إرسال الطلب",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof WaiterCallData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const selectedRequestType = requestTypes.find(type => type.value === formData.request_type)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="lg"
          className={`bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 hover:from-emerald-600 hover:to-teal-700 shadow-lg transition-all duration-200 ${className}`}
        >
          <Bell className="ml-2 h-5 w-5" />
          استدعاء النادل
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md" dir="rtl">
        {isSuccess ? (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto h-16 w-16 text-emerald-500 mb-4" />
            <DialogTitle className="text-xl text-emerald-700 mb-2 font-semibold text-center">
              تم إرسال الطلب بنجاح!
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-base text-center">
              سيصل النادل إلى طاولتكم قريباً
            </DialogDescription>
          </div>
        ) : (
          <>
            <DialogHeader className="text-center">
              <DialogTitle className="flex items-center justify-center gap-2 text-xl font-semibold text-gray-800">
                <Bell className="h-6 w-6 text-emerald-600" />
                استدعاء النادل
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-base mt-2 text-center">
                اختر نوع الطلب وسيصل النادل إليكم فوراً
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="table_number" className="text-base font-medium text-gray-700 text-right block">رقم الطاولة</Label>
                <Input
                  id="table_number"
                  type="number"
                  min="1"
                  value={formData.table_number || ''}
                  onChange={(e) => handleInputChange('table_number', parseInt(e.target.value) || 0)}
                  placeholder="أدخل رقم الطاولة"
                  required
                  disabled={!!tableNumber}
                  className="text-center text-lg font-semibold h-12"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium text-gray-700 text-right block">نوع الطلب</Label>
                <div className="grid grid-cols-2 gap-3">
                  {requestTypes.map((type) => {
                    const Icon = type.icon
                    const isSelected = formData.request_type === type.value
                    return (
                      <Card 
                        key={type.value}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          isSelected 
                            ? `${type.color} border-2 shadow-md` 
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => handleInputChange('request_type', type.value)}
                      >
                        <CardContent className="p-4 text-center">
                          <Icon className={`h-6 w-6 mx-auto mb-2 ${
                            isSelected ? 'text-current' : 'text-gray-500'
                          }`} />
                          <div className={`text-sm font-medium text-center ${
                            isSelected ? 'text-current' : 'text-gray-700'
                          }`}>
                            {type.label}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-base font-medium text-gray-700 text-right block">ملاحظات إضافية (اختياري)</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="أي تفاصيل إضافية تود إضافتها..."
                  rows={3}
                  className="resize-none text-right"
                />
              </div>

              <DialogFooter className="gap-3 pt-4 flex flex-row-reverse">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11"
                >
                  {isLoading ? (
                    <>
                      <Clock className="ml-2 h-4 w-4 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Bell className="ml-2 h-4 w-4" />
                      إرسال الطلب
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}