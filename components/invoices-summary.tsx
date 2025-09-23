import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Receipt, FileText, Clock, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

// Datos de ejemplo de facturas
const invoiceStats = {
  total: 24,
  thisMonth: 8,
  totalAmount: 45230.5,
  pending: 3,
  paid: 18,
  overdue: 2,
  draft: 1,
}

const recentInvoices = [
  {
    id: "INV-2024-0024",
    customer: "Empresa ABC S.L.",
    amount: 1815.0,
    status: "paid",
    date: "2024-01-20",
  },
  {
    id: "INV-2024-0023",
    customer: "Juan Pérez García",
    amount: 605.0,
    status: "pending",
    date: "2024-01-18",
  },
  {
    id: "INV-2024-0022",
    customer: "Tecnología Avanzada S.A.",
    amount: 2420.0,
    status: "overdue",
    date: "2024-01-15",
  },
]

const statusConfig = {
  draft: { label: "Borrador", color: "bg-gray-100 text-gray-800", icon: FileText },
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  paid: { label: "Pagada", color: "bg-green-100 text-green-800", icon: CheckCircle },
  overdue: { label: "Vencida", color: "bg-red-100 text-red-800", icon: AlertCircle },
}

export function InvoicesSummary() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center">
            <Receipt className="h-5 w-5 mr-2" />
            Resumen de Facturas
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/invoices">
              Ver Todas <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estadísticas principales */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">€{invoiceStats.totalAmount.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Facturación Total</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">{invoiceStats.thisMonth}</div>
            <div className="text-xs text-muted-foreground">Este Mes</div>
          </div>
        </div>

        {/* Estados de facturas */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pagadas:</span>
            <span className="font-medium text-green-600">{invoiceStats.paid}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pendientes:</span>
            <span className="font-medium text-yellow-600">{invoiceStats.pending}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vencidas:</span>
            <span className="font-medium text-red-600">{invoiceStats.overdue}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Borradores:</span>
            <span className="font-medium text-gray-600">{invoiceStats.draft}</span>
          </div>
        </div>

        {/* Facturas recientes */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Facturas Recientes</h4>
          {recentInvoices.map((invoice) => {
            const config = statusConfig[invoice.status]
            const StatusIcon = config.icon
            return (
              <div key={invoice.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{invoice.id}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${config.color}`}>{config.label}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{invoice.customer}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">€{invoice.amount.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(invoice.date).toLocaleDateString("es-ES")}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Botón de acción rápida */}
        <Button className="w-full" asChild>
          <Link href="/invoices?action=create">
            <Receipt className="h-4 w-4 mr-2" />
            Nueva Factura
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
