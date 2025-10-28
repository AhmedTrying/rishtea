import UserManagement from "@/components/admin/user-management"

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
        <p className="text-muted-foreground">إدارة حسابات المستخدمين والموظفين</p>
      </div>
      <UserManagement />
    </div>
  )
}