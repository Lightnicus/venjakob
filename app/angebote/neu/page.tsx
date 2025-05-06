import { MainLayout } from "@/components/main-layout"
import { AngebotEditorWithDb } from "@/components/angebot-editor-with-db"
import { Suspense } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"

interface AngeboteNeuPageProps {
  searchParams?: {
    verkaufschance?: string
  }
}

export default function AngeboteNeuPage({ searchParams }: AngeboteNeuPageProps) {
  const verkaufschanceId = searchParams?.verkaufschance

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Neues Angebot erstellen</h1>
        <Suspense
          fallback={
            <div className="flex justify-center p-12">
              <LoadingSpinner size={40} />
            </div>
          }
        >
          <AngebotEditorWithDb isNew={true} verkaufschanceId={verkaufschanceId} />
        </Suspense>
      </div>
    </MainLayout>
  )
}
