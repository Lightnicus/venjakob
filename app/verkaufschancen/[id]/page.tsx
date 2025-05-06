import { MainLayout } from "@/components/main-layout"
import { VerkaufschanceDetails } from "@/components/verkaufschance-details"

export default function VerkaufschancePage({ params }: { params: { id: string } }) {
  return (
    <MainLayout>
      <VerkaufschanceDetails id={params.id} />
    </MainLayout>
  )
}
