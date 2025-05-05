import { MainLayout } from "@/components/main-layout"
import { BlockEditor } from "@/components/block-editor"

export default function BlockPage({ params }: { params: { id: string } }) {
  return (
    <MainLayout>
      <BlockEditor id={params.id} />
    </MainLayout>
  )
}
