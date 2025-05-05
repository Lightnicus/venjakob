import { MainLayout } from "@/components/main-layout"
import { UsersTable } from "@/components/users-table"

export default function UsersPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <a
            href="/users/new"
            className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            New User
          </a>
        </div>
        <UsersTable />
      </div>
    </MainLayout>
  )
}
