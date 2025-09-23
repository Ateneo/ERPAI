import { AccountsOverview } from "@/components/accounts-overview"
import { RecentTransactions } from "@/components/recent-transactions"
import { BusinessMetrics } from "@/components/business-metrics"
import { InvoicesSummary } from "@/components/invoices-summary"
import { BusinessCalendar } from "@/components/calendar/business-calendar"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Panel Principal</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <AccountsOverview />
        </div>
        <div className="lg:col-span-1">
          <RecentTransactions />
        </div>
        <div className="lg:col-span-1">
          <InvoicesSummary />
        </div>
      </div>

      <BusinessMetrics />

      {/* Nuevo calendario de negocio */}
      <BusinessCalendar />
    </div>
  )
}
