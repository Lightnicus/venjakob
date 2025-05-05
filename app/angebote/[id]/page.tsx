import { MainLayout } from "@/components/main-layout"
import { AngebotEditor } from "@/components/angebot-editor"

export default function AngebotPage({ params }: { params: { id: string } }) {
  return (
    <MainLayout>
      <AngebotEditor id={params.id} />
    </MainLayout>
  )
}
