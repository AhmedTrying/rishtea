import CustomerManagement from "@/components/admin/customer-management"

export const dynamic = "force-dynamic"

export default function CustomersPage() {
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">إدارة العملاء</h1>
      <CustomerManagement />
    </div>
  )
}