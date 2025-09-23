import { Suspense } from "react"
import { InvoicesContent } from "@/components/invoices/invoices-content"
import { InvoicesLoading } from "@/components/invoices/invoices-loading"

export default function InvoicesPage() {
  return (
    <Suspense fallback={<InvoicesLoading />}>
      <InvoicesContent />
    </Suspense>
  )
}
