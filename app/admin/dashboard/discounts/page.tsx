import DiscountManagement from "@/components/admin/discount-management"

export default function DiscountsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">إدارة الخصومات</h1>
        <p className="text-muted-foreground">إدارة أكواد الخصم والعروض الترويجية</p>
      </div>
      <DiscountManagement />
    </div>
  )
}