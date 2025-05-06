import { MainLayout } from "@/components/main-layout"
import { UserEditor } from "@/components/user-editor"

export default function UserEditPage({ params }: { params: { id: string } }) {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Edit User</h1>
        </div>
        <UserEditor userId={params.id} mode="edit" />
      </div>
    </MainLayout>
  )
}
