import { MainLayout } from "@/components/main-layout"
import { VerkaufschanceEditor } from "@/components/verkaufschance-editor"

export default function VerkaufschanceBearbeitenPage({ params }: { params: { id: string } }) {
  return (
    <MainLayout>
      <VerkaufschanceEditor id={params.id} />
    </MainLayout>
  )
}
