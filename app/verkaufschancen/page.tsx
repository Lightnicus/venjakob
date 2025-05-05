import { MainLayout } from "@/components/main-layout"
import { VerkaufschancenTable } from "@/components/verkaufschancen-table"

export default function VerkaufschancenPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Verkaufschancen</h1>
        </div>
        <VerkaufschancenTable />
      </div>
    </MainLayout>
  )
}
