import { MainLayout } from "@/components/main-layout"
import { ArtikelEditor } from "@/components/artikel-editor"

interface ArtikelBearbeitenPageProps {
  params: {
    id: string
  }
}

export default function ArtikelBearbeitenPage({ params }: ArtikelBearbeitenPageProps) {
  return (
    <MainLayout>
      <ArtikelEditor id={params.id} />
    </MainLayout>
  )
}
