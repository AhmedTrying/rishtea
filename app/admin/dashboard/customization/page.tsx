"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Loader2,
  Package,
  Tag,
  Coffee,
  Move,
  Eye,
  EyeOff
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
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

interface CustomizationGroup {
  id: string
  name_ar: string
  name_en: string
  description_ar?: string
  description_en?: string
  type: 'single_choice' | 'multiple_choice' | 'quantity'
  is_required: boolean
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  options?: CustomizationOption[]
}

interface CustomizationOption {
  id: string
  group_id: string
  name_ar: string
  name_en: string
  description_ar?: string
  description_en?: string
  price_modifier: number
  icon?: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Product {
  id: string
  name_ar: string
  name_en?: string
}

interface Category {
  id: string
  name_ar: string
  name_en?: string
}

export default function CustomizationManagementPage() {
  const [groups, setGroups] = useState<CustomizationGroup[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingGroup, setEditingGroup] = useState<CustomizationGroup | null>(null)
  const [editingOption, setEditingOption] = useState<CustomizationOption | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<string>("")
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null)
  const [deleteOptionId, setDeleteOptionId] = useState<string | null>(null)
  const [showGroupDialog, setShowGroupDialog] = useState(false)
  const [showOptionDialog, setShowOptionDialog] = useState(false)
  
  const [newGroup, setNewGroup] = useState({
    name_ar: "",
    name_en: "",
    description_ar: "",
    description_en: "",
    type: "single_choice" as 'single_choice' | 'multiple_choice' | 'quantity',
    is_required: false,
    display_order: 0,
    is_active: true
  })

  const [newOption, setNewOption] = useState({
    name_ar: "",
    name_en: "",
    description_ar: "",
    description_en: "",
    price_modifier: 0,
    icon: "",
    display_order: 0,
    is_active: true
  })

  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch customization groups with their options
      const { data: groupsData, error: groupsError } = await supabase
        .from("customization_groups")
        .select(`
          *,
          customization_options (*)
        `)
        .order("display_order", { ascending: true })

      if (groupsError) throw groupsError

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("id, name_ar, name_en")
        .eq("is_available", true)
        .order("name_ar")

      if (productsError) throw productsError

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name_ar, name_en")
        .eq("is_active", true)
        .order("name_ar")

      if (categoriesError) throw categoriesError

      setGroups(groupsData || [])
      setProducts(productsData || [])
      setCategories(categoriesData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل البيانات",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveGroup = async () => {
    setSaving(true)
    try {
      if (editingGroup) {
        // Update existing group
        const { error } = await supabase
          .from("customization_groups")
          .update({
            name_ar: newGroup.name_ar,
            name_en: newGroup.name_en,
            description_ar: newGroup.description_ar,
            description_en: newGroup.description_en,
            type: newGroup.type,
            is_required: newGroup.is_required,
            display_order: newGroup.display_order,
            is_active: newGroup.is_active,
            updated_at: new Date().toISOString()
          })
          .eq("id", editingGroup.id)

        if (error) throw error

        toast({
          title: "تم التحديث",
          description: "تم تحديث مجموعة التخصيص بنجاح",
        })
      } else {
        // Create new group
        const { error } = await supabase
          .from("customization_groups")
          .insert([{
            name_ar: newGroup.name_ar,
            name_en: newGroup.name_en,
            description_ar: newGroup.description_ar,
            description_en: newGroup.description_en,
            type: newGroup.type,
            is_required: newGroup.is_required,
            display_order: newGroup.display_order,
            is_active: newGroup.is_active
          }])

        if (error) throw error

        toast({
          title: "تم الإنشاء",
          description: "تم إنشاء مجموعة التخصيص بنجاح",
        })
      }

      setShowGroupDialog(false)
      setEditingGroup(null)
      resetGroupForm()
      fetchData()
    } catch (error) {
      console.error("Error saving group:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ في حفظ مجموعة التخصيص",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveOption = async () => {
    if (!selectedGroupId) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار مجموعة التخصيص أولاً",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      if (editingOption) {
        // Update existing option
        const { error } = await supabase
          .from("customization_options")
          .update({
            name_ar: newOption.name_ar,
            name_en: newOption.name_en,
            description_ar: newOption.description_ar,
            description_en: newOption.description_en,
            price_modifier: newOption.price_modifier,
            icon: newOption.icon,
            display_order: newOption.display_order,
            is_active: newOption.is_active,
            updated_at: new Date().toISOString()
          })
          .eq("id", editingOption.id)

        if (error) throw error

        toast({
          title: "تم التحديث",
          description: "تم تحديث خيار التخصيص بنجاح",
        })
      } else {
        // Create new option
        const { error } = await supabase
          .from("customization_options")
          .insert([{
            group_id: selectedGroupId,
            name_ar: newOption.name_ar,
            name_en: newOption.name_en,
            description_ar: newOption.description_ar,
            description_en: newOption.description_en,
            price_modifier: newOption.price_modifier,
            icon: newOption.icon,
            display_order: newOption.display_order,
            is_active: newOption.is_active
          }])

        if (error) throw error

        toast({
          title: "تم الإنشاء",
          description: "تم إنشاء خيار التخصيص بنجاح",
        })
      }

      setShowOptionDialog(false)
      setEditingOption(null)
      resetOptionForm()
      fetchData()
    } catch (error) {
      console.error("Error saving option:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ في حفظ خيار التخصيص",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from("customization_groups")
        .delete()
        .eq("id", groupId)

      if (error) throw error

      toast({
        title: "تم الحذف",
        description: "تم حذف مجموعة التخصيص بنجاح",
      })

      fetchData()
    } catch (error) {
      console.error("Error deleting group:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ في حذف مجموعة التخصيص",
        variant: "destructive",
      })
    }
    setDeleteGroupId(null)
  }

  const handleDeleteOption = async (optionId: string) => {
    try {
      const { error } = await supabase
        .from("customization_options")
        .delete()
        .eq("id", optionId)

      if (error) throw error

      toast({
        title: "تم الحذف",
        description: "تم حذف خيار التخصيص بنجاح",
      })

      fetchData()
    } catch (error) {
      console.error("Error deleting option:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ في حذف خيار التخصيص",
        variant: "destructive",
      })
    }
    setDeleteOptionId(null)
  }

  const resetGroupForm = () => {
    setNewGroup({
      name_ar: "",
      name_en: "",
      description_ar: "",
      description_en: "",
      type: "single_choice",
      is_required: false,
      display_order: 0,
      is_active: true
    })
  }

  const resetOptionForm = () => {
    setNewOption({
      name_ar: "",
      name_en: "",
      description_ar: "",
      description_en: "",
      price_modifier: 0,
      icon: "",
      display_order: 0,
      is_active: true
    })
  }

  const openEditGroup = (group: CustomizationGroup) => {
    setEditingGroup(group)
    setNewGroup({
      name_ar: group.name_ar,
      name_en: group.name_en || "",
      description_ar: group.description_ar || "",
      description_en: group.description_en || "",
      type: group.type,
      is_required: group.is_required,
      display_order: group.display_order,
      is_active: group.is_active
    })
    setShowGroupDialog(true)
  }

  const openEditOption = (option: CustomizationOption) => {
    setEditingOption(option)
    setSelectedGroupId(option.group_id)
    setNewOption({
      name_ar: option.name_ar,
      name_en: option.name_en || "",
      description_ar: option.description_ar || "",
      description_en: option.description_en || "",
      price_modifier: option.price_modifier,
      icon: option.icon || "",
      display_order: option.display_order,
      is_active: option.is_active
    })
    setShowOptionDialog(true)
  }

  const openNewGroup = () => {
    setEditingGroup(null)
    resetGroupForm()
    setShowGroupDialog(true)
  }

  const openNewOption = (groupId?: string) => {
    setEditingOption(null)
    setSelectedGroupId(groupId || "")
    resetOptionForm()
    setShowOptionDialog(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة خيارات التخصيص</h1>
          <p className="text-muted-foreground">إدارة مجموعات وخيارات تخصيص المنتجات</p>
        </div>
        <Button onClick={openNewGroup} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة مجموعة جديدة
        </Button>
      </div>

      <Tabs defaultValue="groups" className="space-y-4">
        <TabsList>
          <TabsTrigger value="groups">مجموعات التخصيص</TabsTrigger>
          <TabsTrigger value="assignment">ربط المنتجات</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-4">
          <div className="grid gap-4">
            {groups.map((group) => (
              <Card key={group.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{group.name_ar}</CardTitle>
                      {group.name_en && (
                        <span className="text-sm text-muted-foreground">({group.name_en})</span>
                      )}
                      <Badge variant={group.is_active ? "default" : "secondary"}>
                        {group.is_active ? "نشط" : "غير نشط"}
                      </Badge>
                      <Badge variant={group.is_required ? "destructive" : "outline"}>
                        {group.is_required ? "مطلوب" : "اختياري"}
                      </Badge>
                      <Badge variant="outline">
                        {group.type === "single_choice" ? "اختيار واحد" : 
                         group.type === "multiple_choice" ? "اختيار متعدد" : "كمية"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openNewOption(group.id)}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        إضافة خيار
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditGroup(group)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteGroupId(group.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {(group.description_ar || group.description_en) && (
                    <p className="text-sm text-muted-foreground">
                      {group.description_ar}
                      {group.description_en && group.description_ar && " | "}
                      {group.description_en}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <h4 className="font-medium text-sm">الخيارات المتاحة:</h4>
                    {group.options && group.options.length > 0 ? (
                      <div className="grid gap-2">
                        {group.options
                          .sort((a, b) => a.display_order - b.display_order)
                          .map((option) => (
                            <div
                              key={option.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                {option.icon && <span className="text-lg">{option.icon}</span>}
                                <div>
                                  <span className="font-medium">{option.name_ar}</span>
                                  {option.name_en && (
                                    <span className="text-sm text-muted-foreground ml-2">
                                      ({option.name_en})
                                    </span>
                                  )}
                                  {option.price_modifier !== 0 && (
                                    <Badge variant="outline" className="mr-2">
                                      {option.price_modifier > 0 ? "+" : ""}
                                      {option.price_modifier} ر.س
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={option.is_active ? "default" : "secondary"}>
                                  {option.is_active ? "نشط" : "غير نشط"}
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditOption(option)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDeleteOptionId(option.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">لا توجد خيارات متاحة</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assignment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ربط مجموعات التخصيص بالمنتجات والفئات</CardTitle>
              <p className="text-sm text-muted-foreground">
                يمكنك ربط مجموعات التخصيص بمنتجات محددة أو بفئات كاملة
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>سيتم إضافة واجهة ربط المنتجات قريباً</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Group Dialog */}
      <Dialog open={showGroupDialog} onOpenChange={setShowGroupDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? "تعديل مجموعة التخصيص" : "إضافة مجموعة تخصيص جديدة"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name_ar">الاسم بالعربية *</Label>
                <Input
                  id="name_ar"
                  value={newGroup.name_ar}
                  onChange={(e) => setNewGroup({ ...newGroup, name_ar: e.target.value })}
                  placeholder="مثال: مستوى السكر"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_en">الاسم بالإنجليزية</Label>
                <Input
                  id="name_en"
                  value={newGroup.name_en}
                  onChange={(e) => setNewGroup({ ...newGroup, name_en: e.target.value })}
                  placeholder="Example: Sugar Level"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description_ar">الوصف بالعربية</Label>
                <Textarea
                  id="description_ar"
                  value={newGroup.description_ar}
                  onChange={(e) => setNewGroup({ ...newGroup, description_ar: e.target.value })}
                  placeholder="اختر مستوى السكر المفضل"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description_en">الوصف بالإنجليزية</Label>
                <Textarea
                  id="description_en"
                  value={newGroup.description_en}
                  onChange={(e) => setNewGroup({ ...newGroup, description_en: e.target.value })}
                  placeholder="Choose your preferred sugar level"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">نوع الاختيار</Label>
                <Select
                  value={newGroup.type}
                  onValueChange={(value: 'single_choice' | 'multiple_choice' | 'quantity') => 
                    setNewGroup({ ...newGroup, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_choice">اختيار واحد</SelectItem>
                    <SelectItem value="multiple_choice">اختيار متعدد</SelectItem>
                    <SelectItem value="quantity">كمية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_order">ترتيب العرض</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={newGroup.display_order}
                  onChange={(e) => setNewGroup({ ...newGroup, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_required"
                    checked={newGroup.is_required}
                    onCheckedChange={(checked) => setNewGroup({ ...newGroup, is_required: checked })}
                  />
                  <Label htmlFor="is_required">مطلوب</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={newGroup.is_active}
                    onCheckedChange={(checked) => setNewGroup({ ...newGroup, is_active: checked })}
                  />
                  <Label htmlFor="is_active">نشط</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGroupDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveGroup} disabled={saving || !newGroup.name_ar}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingGroup ? "تحديث" : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Option Dialog */}
      <Dialog open={showOptionDialog} onOpenChange={setShowOptionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingOption ? "تعديل خيار التخصيص" : "إضافة خيار تخصيص جديد"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!editingOption && (
              <div className="space-y-2">
                <Label htmlFor="group_select">مجموعة التخصيص *</Label>
                <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر مجموعة التخصيص" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name_ar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="option_name_ar">الاسم بالعربية *</Label>
                <Input
                  id="option_name_ar"
                  value={newOption.name_ar}
                  onChange={(e) => setNewOption({ ...newOption, name_ar: e.target.value })}
                  placeholder="مثال: بدون سكر"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="option_name_en">الاسم بالإنجليزية</Label>
                <Input
                  id="option_name_en"
                  value={newOption.name_en}
                  onChange={(e) => setNewOption({ ...newOption, name_en: e.target.value })}
                  placeholder="Example: No Sugar"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="option_description_ar">الوصف بالعربية</Label>
                <Input
                  id="option_description_ar"
                  value={newOption.description_ar}
                  onChange={(e) => setNewOption({ ...newOption, description_ar: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="option_description_en">الوصف بالإنجليزية</Label>
                <Input
                  id="option_description_en"
                  value={newOption.description_en}
                  onChange={(e) => setNewOption({ ...newOption, description_en: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon">الأيقونة (إيموجي)</Label>
                <Input
                  id="icon"
                  value={newOption.icon}
                  onChange={(e) => setNewOption({ ...newOption, icon: e.target.value })}
                  placeholder="🚫"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_modifier">تعديل السعر (ر.س)</Label>
                <Input
                  id="price_modifier"
                  type="number"
                  step="0.01"
                  value={newOption.price_modifier}
                  onChange={(e) => setNewOption({ ...newOption, price_modifier: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="option_display_order">ترتيب العرض</Label>
                <Input
                  id="option_display_order"
                  type="number"
                  value={newOption.display_order}
                  onChange={(e) => setNewOption({ ...newOption, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="option_is_active"
                checked={newOption.is_active}
                onCheckedChange={(checked) => setNewOption({ ...newOption, is_active: checked })}
              />
              <Label htmlFor="option_is_active">نشط</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOptionDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveOption} disabled={saving || !newOption.name_ar || !selectedGroupId}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingOption ? "تحديث" : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Group Confirmation */}
      <AlertDialog open={!!deleteGroupId} onOpenChange={() => setDeleteGroupId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه المجموعة؟ سيتم حذف جميع الخيارات المرتبطة بها أيضاً.
              هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteGroupId && handleDeleteGroup(deleteGroupId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Option Confirmation */}
      <AlertDialog open={!!deleteOptionId} onOpenChange={() => setDeleteOptionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الخيار؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteOptionId && handleDeleteOption(deleteOptionId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}