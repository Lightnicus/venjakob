import { MainLayout } from "@/components/main-layout"
import { AuftragsbestaetigungenTable } from "@/components/auftragsbestaetigungen-table"

export default function AuftragsbestaetigungenPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Auftragsbestätigungen</h1>
        </div>
        <AuftragsbestaetigungenTable />
      </div>
    </MainLayout>
  )
}
