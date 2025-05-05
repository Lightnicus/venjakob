import { MainLayout } from "@/components/main-layout"
import { QuotationEditor } from "@/components/quotation-editor"

export default function QuotationPage({ params }: { params: { id: string } }) {
  return (
    <MainLayout>
      <QuotationEditor id={params.id} />
    </MainLayout>
  )
}
