import { MainLayout } from "@/components/main-layout"
import { UserEditor } from "@/components/user-editor"

export default function NewUserPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">New User</h1>
        </div>
        <UserEditor mode="create" />
      </div>
    </MainLayout>
  )
}
