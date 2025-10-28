"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Trash2, Search, Filter, Eye, ArrowUpDown, Plus, Settings } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { useDebounce } from "@/hooks/use-debounce"
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

interface Product {
  id: string
  name_ar: string
  name_en?: string
  sku?: string
  base_price?: number
  price?: number
  status: 'available' | 'sold_out' | 'hidden'
  priority_order: number
  is_seasonal: boolean
  allow_customer_notes: boolean
  image_url?: string
  is_available: boolean
  active: boolean
  categories?: {
    id: string
    name_ar: string
    name_en?: string
    color?: string
  }
  product_images?: Array<{
    id: string
    image_url: string
    is_main: boolean
  }>
  product_sizes?: Array<{
    id: string
    name_ar: string
    name_en?: string
    price: number
  }>
  product_add_ons?: Array<{
    id: string
    add_ons: {
      name_ar: string
      name_en?: string
      price: number
    }
  }>
}

interface Category {
  id: string
  name_ar: string
  name_en?: string
  color?: string
}

interface AddOn {
  id: string
  name_ar: string
  name_en?: string
  price: number
}

interface SearchParams {
  page?: string
  search?: string
  category?: string
  status?: string
  sortBy?: string
  sortOrder?: string
}

export default function ProductsTable({ 
  categories, 
  addOns,
  searchParams 
}: { 
  categories: Category[]
  addOns: AddOn[]
  searchParams: SearchParams
}) {
  const router = useRouter()
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.search || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.category || 'all')
  // Sanitize incoming status from URL: default to 'all' if invalid
  const allowedStatuses = new Set(['available', 'sold_out', 'hidden'])
  const initialStatus = allowedStatuses.has((searchParams.status || '').toString()) ? (searchParams.status as string) : 'all'
  const [selectedStatus, setSelectedStatus] = useState(initialStatus)
  const [sortBy, setSortBy] = useState(searchParams.sortBy || 'priority_order')
  const [sortOrder, setSortOrder] = useState(searchParams.sortOrder || 'asc')

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', searchParams.page || '1')
      params.set('limit', '10')
      
      if (debouncedSearchTerm) params.set('search', debouncedSearchTerm)
      if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory)
      if (selectedStatus && selectedStatus !== 'all') params.set('status', selectedStatus)
      if (sortBy) params.set('sortBy', sortBy)
      if (sortOrder) params.set('sortOrder', sortOrder)

      const response = await fetch(`/api/products?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setProducts(data.products || [])
        setPagination(data.pagination || {})
      } else {
        console.error('Error fetching products:', data.error)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearchTerm, selectedCategory, selectedStatus, sortBy, sortOrder, searchParams.page])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const updateURL = useCallback(() => {
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)
    if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory)
    if (selectedStatus && selectedStatus !== 'all') params.set('status', selectedStatus)
    if (sortBy !== 'priority_order') params.set('sortBy', sortBy)
    if (sortOrder !== 'asc') params.set('sortOrder', sortOrder)
    
    const newURL = `/admin/dashboard/products${params.toString() ? `?${params.toString()}` : ''}`
    router.push(newURL, { scroll: false })
  }, [searchTerm, selectedCategory, selectedStatus, sortBy, sortOrder, router])

  useEffect(() => {
    updateURL()
  }, [debouncedSearchTerm, selectedCategory, selectedStatus, sortBy, sortOrder])

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/products/${deleteId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchProducts()
      } else {
        console.error('Error deleting product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }

    setIsDeleting(false)
    setDeleteId(null)
  }

  const getStatusBadge = (product: Product) => {
    if (!product.active) {
      return <Badge variant="destructive">معطل</Badge>
    }
    
    switch (product.status) {
      case 'available':
        return <Badge variant="default">متاح</Badge>
      case 'sold_out':
        return <Badge variant="secondary">نفد المخزون</Badge>
      case 'hidden':
        return <Badge variant="outline">مخفي</Badge>
      default:
        return <Badge variant="secondary">غير محدد</Badge>
    }
  }

  const getMainImage = (product: Product) => {
    if (product.product_images && product.product_images.length > 0) {
      const mainImage = product.product_images.find(img => img.is_main) || product.product_images[0]
      return mainImage.image_url
    }
    return product.image_url || "/placeholder.svg"
  }

  const getDisplayPrice = (product: Product) => {
    if (product.is_market_price) {
      return "سعر السوق"
    }
    
    if (product.product_sizes && product.product_sizes.length > 0) {
      const prices = product.product_sizes.map(size => size.price)
      const minPrice = Math.min(...prices)
      const maxPrice = Math.max(...prices)
      
      if (minPrice === maxPrice) {
        return `${minPrice.toFixed(2)} ر.س`
      }
      return `${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)} ر.س`
    }
    
    return product.base_price ? `${product.base_price.toFixed(2)} ر.س` : 
           product.price ? `${product.price.toFixed(2)} ر.س` : "غير محدد"
  }

  return (
    <>
      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            البحث والتصفية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث بالاسم أو الكود..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="جميع الفئات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name_ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="available">متاح</SelectItem>
                <SelectItem value="sold_out">نفد المخزون</SelectItem>
                <SelectItem value="hidden">مخفي</SelectItem>
              </SelectContent>
            </Select>

            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [newSortBy, newSortOrder] = value.split('-')
              setSortBy(newSortBy)
              setSortOrder(newSortOrder)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="ترتيب حسب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priority_order-asc">الأولوية (تصاعدي)</SelectItem>
                <SelectItem value="priority_order-desc">الأولوية (تنازلي)</SelectItem>
                <SelectItem value="name_ar-asc">الاسم (أ-ي)</SelectItem>
                <SelectItem value="name_ar-desc">الاسم (ي-أ)</SelectItem>
                <SelectItem value="created_at-desc">الأحدث</SelectItem>
                <SelectItem value="created_at-asc">الأقدم</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">جاري تحميل المنتجات...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الصورة</TableHead>
                  <TableHead className="text-right">المنتج</TableHead>
                  <TableHead className="text-right">الفئة</TableHead>
                  <TableHead className="text-right">السعر</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الأولوية</TableHead>
                  <TableHead className="text-right">الإضافات</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {searchTerm || (selectedCategory && selectedCategory !== 'all') || (selectedStatus && selectedStatus !== 'all') ? 
                        "لا توجد منتجات تطابق معايير البحث" : 
                        "لا توجد منتجات"
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Image
                          src={getMainImage(product)}
                          alt={product.name_ar}
                          width={48}
                          height={48}
                          className="rounded-lg object-cover"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{product.name_ar}</div>
                          {product.name_en && (
                            <div className="text-sm text-muted-foreground">{product.name_en}</div>
                          )}
                          {product.sku && (
                            <div className="text-xs text-muted-foreground">كود: {product.sku}</div>
                          )}
                          {product.is_seasonal && (
                            <Badge variant="outline" className="text-xs">موسمي</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {product.categories?.color && (
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: product.categories.color }}
                            />
                          )}
                          {product.categories?.name_ar || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{getDisplayPrice(product)}</div>
                        {product.product_sizes && product.product_sizes.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {product.product_sizes.length} أحجام
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(product)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.priority_order}</Badge>
                      </TableCell>
                      <TableCell>
                        {product.product_add_ons && product.product_add_ons.length > 0 ? (
                          <Badge variant="secondary">
                            {product.product_add_ons.length} إضافة
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/dashboard/products/${product.id}/preview`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/dashboard/products/${product.id}`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(product.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            عرض {((pagination.page - 1) * pagination.limit) + 1} إلى {Math.min(pagination.page * pagination.limit, pagination.total)} من {pagination.total} منتج
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => {
                const params = new URLSearchParams(window.location.search)
                params.set('page', String(pagination.page - 1))
                router.push(`/admin/dashboard/products?${params.toString()}`)
              }}
            >
              السابق
            </Button>
            <span className="text-sm">
              صفحة {pagination.page} من {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => {
                const params = new URLSearchParams(window.location.search)
                params.set('page', String(pagination.page + 1))
                router.push(`/admin/dashboard/products?${params.toString()}`)
              }}
            >
              التالي
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "جاري الحذف..." : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
