import { MainLayout } from "@/components/main-layout"
import { AngebotEditor } from "@/components/angebot-editor"

export default async function AngebotPage({ params }: { params: { id: string } }) {
  return (
    <MainLayout>
      <AngebotEditor />
    </MainLayout>
  )
}
