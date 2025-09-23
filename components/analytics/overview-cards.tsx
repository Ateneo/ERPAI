import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Euro, Users, FileText, TrendingUp, Receipt, CheckCircle2, Clock, AlertTriangle } from "lucide-react"

const cards = [
  {
    title: "Facturación Total",
    icon: Euro,
    amount: "€127,450.89",
    description: "+18.2% respecto al mes anterior",
    trend: "up",
  },
  {
    title: "Clientes Activos",
    icon: Users,
    amount: "156",
    description: "+12 nuevos este mes",
    trend: "up",
  },
  {
    title: "Facturas Emitidas",
    icon: Receipt,
    amount: "89",
    description: "78 enviadas a Verifactu",
    trend: "up",
  },
  {
    title: "Contratos Generados",
    icon: FileText,
    amount: "34",
    description: "+8 este mes",
    trend: "up",
  },
]

const verifactuStats = [
  {
    title: "Enviadas a Verifactu",
    icon: CheckCircle2,
    amount: "78",
    description: "87.6% del total",
    trend: "up",
    color: "text-green-600",
  },
  {
    title: "Pendientes de Envío",
    icon: Clock,
    amount: "8",
    description: "9.0% del total",
    trend: "neutral",
    color: "text-yellow-600",
  },
  {
    title: "Con Errores",
    icon: AlertTriangle,
    amount: "3",
    description: "3.4% del total",
    trend: "down",
    color: "text-red-600",
  },
]

export function OverviewCards() {
  return (
    <div className="space-y-8">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.amount}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              <div
                className={`mt-2 flex items-center text-xs ${card.trend === "up" ? "text-green-500" : "text-red-500"}`}
              >
                {card.trend === "up" ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <TrendingUp className="mr-1 h-3 w-3 transform rotate-180" />
                )}
                {card.description.split(" ")[0]}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estado Verifactu */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estado Verifactu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {verifactuStats.map((stat) => (
              <div key={stat.title} className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50/50">
                <stat.icon className={`h-10 w-10 ${stat.color} flex-shrink-0`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.amount}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
