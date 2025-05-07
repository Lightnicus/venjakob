import { MainLayout } from "@/components/main-layout"
import { BlockEditor } from "@/components/block-editor"

export default async function BlockEditPage({ params }: { params: { id: string } }) {
  return (
    <MainLayout>
      <BlockEditor id={params.id} />
    </MainLayout>
  )
}
