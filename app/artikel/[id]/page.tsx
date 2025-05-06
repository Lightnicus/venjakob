import { MainLayout } from "@/components/main-layout"
import { ArtikelDetails } from "@/components/artikel-details"

interface ArtikelDetailsPageProps {
  params: {
    id: string
  }
}

export default function ArtikelDetailsPage({ params }: ArtikelDetailsPageProps) {
  return (
    <MainLayout>
      <ArtikelDetails id={params.id} />
    </MainLayout>
  )
}
