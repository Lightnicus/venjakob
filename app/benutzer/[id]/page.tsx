import { MainLayout } from "@/components/main-layout"
import { UserDetails } from "@/components/user-details"

export default function UserDetailsPage({ params }: { params: { id: string } }) {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">User Details</h1>
        </div>
        <UserDetails userId={params.id} />
      </div>
    </MainLayout>
  )
}
