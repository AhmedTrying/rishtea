"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, ShoppingCart, Settings, FolderTree, BarChart3, Users, Percent, Receipt, Circle } from "lucide-react"

const menuItems = [
  {
    title: "لوحة المعلومات",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "لوحة التحكم المتقدمة",
    href: "/admin/dashboard/enhanced",
    icon: BarChart3,
  },
  {
    title: "الطلبات",
    href: "/admin/dashboard/orders",
    icon: ShoppingCart,
  },
  {
    title: "المنتجات",
    href: "/admin/dashboard/products",
    icon: Package,
  },
  {
    title: "الفئات",
    href: "/admin/dashboard/categories",
    icon: FolderTree,
  },
  {
    title: "إدارة المستخدمين",
    href: "/admin/dashboard/users",
    icon: Users,
  },
  {
    title: "العملاء",
    href: "/admin/dashboard/customers",
    icon: Users,
  },
  {
    title: "إدارة الخصومات",
    href: "/admin/dashboard/discounts",
    icon: Percent,
  },
  {
    title: "الضرائب",
    href: "/admin/dashboard/taxes",
    icon: Receipt,
  },
  {
    title: "الإعدادات",
    href: "/admin/dashboard/settings",
    icon: Settings,
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-card border-l border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <Image src="/logo.png" alt="شاي ريش" width={48} height={48} className="rounded-xl" />
          <div>
            <h2 className="text-xl font-bold"> شاي ريش </h2>
            <p className="text-xs text-muted-foreground">لوحة التحكم</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const IconComp = item.icon ?? Circle
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent text-muted-foreground hover:text-foreground",
              )}
            >
              {IconComp ? <IconComp className="w-5 h-5" /> : null}
              <span className="font-medium">{item.title}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
