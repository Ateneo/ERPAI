import { Suspense } from "react"
import { AnalyticsContent } from "@/components/analytics/analytics-content"
import { AnalyticsLoading } from "@/components/analytics/analytics-loading"

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<AnalyticsLoading />}>
      <AnalyticsContent />
    </Suspense>
  )
}
