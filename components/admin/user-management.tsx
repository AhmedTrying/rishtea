"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Loader2, Users, Save, X, Edit, Trash2, Plus, Eye, EyeOff } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "staff" | "kitchen"
  active: boolean
  created_at: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "staff" as "admin" | "manager" | "staff" | "kitchen",
    password: "",
    active: true,
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("staff_profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "خطأ",
        description: "فشل في تحميل المستخدمين",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveUser = async () => {
    if (!newUser.name || !newUser.email || (!editingUser && !newUser.password)) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      if (editingUser) {
        // Update existing user
        const updateData: any = {
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          active: newUser.active,
          updated_at: new Date().toISOString(),
        }

        // Only update password if provided
        if (newUser.password) {
          updateData.password_hash = newUser.password // In real app, this should be hashed
        }

        const { error } = await supabase
          .from("staff_profiles")
          .update(updateData)
          .eq("id", editingUser.id)

        if (error) throw error
        toast({
          title: "نجح",
          description: "تم تحديث المستخدم بنجاح",
        })
      } else {
        // Create new user
        const { error } = await supabase
          .from("staff_profiles")
          .insert([{
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            active: newUser.active,
            password_hash: newUser.password, // In real app, this should be hashed
          }])

        if (error) throw error
        toast({
          title: "نجح",
          description: "تم إضافة المستخدم بنجاح",
        })
      }

      resetForm()
      fetchUsers()
    } catch (error) {
      console.error("Error saving user:", error)
      toast({
        title: "خطأ",
        description: "فشل في حفظ المستخدم",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
      active: user.active,
    })
    setShowForm(true)
  }

  const handleDeleteUser = async () => {
    if (!deleteUserId) return

    try {
      const { error } = await supabase
        .from("staff_profiles")
        .delete()
        .eq("id", deleteUserId)

      if (error) throw error
      toast({
        title: "نجح",
        description: "تم حذف المستخدم بنجاح",
      })
      fetchUsers()
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "خطأ",
        description: "فشل في حذف المستخدم",
        variant: "destructive",
      })
    } finally {
      setDeleteUserId(null)
    }
  }

  const resetForm = () => {
    setNewUser({
      name: "",
      email: "",
      role: "staff",
      password: "",
      active: true,
    })
    setEditingUser(null)
    setShowForm(false)
    setShowPassword(false)
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin":
        return "مدير"
      case "manager":
        return "مدير فرع"
      case "staff":
        return "موظف"
      case "kitchen":
        return "مطبخ"
      default:
        return role
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive"
      case "manager":
        return "default"
      case "staff":
        return "secondary"
      case "kitchen":
        return "outline"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6" />
            <h2 className="text-2xl font-bold">إدارة المستخدمين</h2>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            إضافة مستخدم جديد
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingUser ? "تعديل المستخدم" : "إضافة مستخدم جديد"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم الكامل</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="أدخل الاسم الكامل"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="أدخل البريد الإلكتروني"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">الدور</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value: "admin" | "manager" | "staff" | "kitchen") =>
                      setNewUser({ ...newUser, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">مدير</SelectItem>
                      <SelectItem value="manager">مدير فرع</SelectItem>
                      <SelectItem value="staff">موظف</SelectItem>
                      <SelectItem value="kitchen">مطبخ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    كلمة المرور {editingUser && "(اتركها فارغة للاحتفاظ بالحالية)"}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder={editingUser ? "كلمة مرور جديدة (اختياري)" : "أدخل كلمة المرور"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="active"
                  checked={newUser.active}
                  onCheckedChange={(checked) => setNewUser({ ...newUser, active: checked })}
                />
                <Label htmlFor="active">نشط</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveUser} disabled={saving} className="gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Save className="w-4 h-4" />
                  {editingUser ? "تحديث" : "حفظ"}
                </Button>
                <Button variant="outline" onClick={resetForm} className="gap-2">
                  <X className="w-4 h-4" />
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{user.name}</h3>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleText(user.role)}
                      </Badge>
                      <Badge variant={user.active ? "default" : "secondary"}>
                        {user.active ? "نشط" : "غير نشط"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      تاريخ الإنشاء: {new Date(user.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          className="gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          تعديل
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>تعديل بيانات المستخدم</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteUserId(user.id)}
                          className="gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          حذف
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>حذف المستخدم</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {users.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا يوجد مستخدمون مضافون بعد</p>
              </CardContent>
            </Card>
          )}
        </div>

        <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground">
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}