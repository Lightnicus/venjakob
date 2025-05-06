import { MainLayout } from "@/components/main-layout"
import { AuftragsbestaetigungDetails } from "@/components/auftragsbestaetigungen-details"

export default function AuftragsbestaetigungPage({ params }: { params: { id: string } }) {
  return (
    <MainLayout>
      <AuftragsbestaetigungDetails id={params.id} />
    </MainLayout>
  )
}
