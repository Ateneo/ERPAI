import { TrendingUp, TrendingDown } from "lucide-react"

const topServices = [
  {
    name: "Servicios de Consultoría",
    revenue: "€45,200",
    growth: "+15.2%",
    trend: "up",
    clients: 23,
    contracts: 12,
  },
  {
    name: "Formación Empresarial",
    revenue: "€32,800",
    growth: "+22.1%",
    trend: "up",
    clients: 18,
    contracts: 8,
  },
  {
    name: "Servicios Tecnológicos",
    revenue: "€28,450",
    growth: "+8.7%",
    trend: "up",
    clients: 15,
    contracts: 7,
  },
  {
    name: "Asesoría Legal",
    revenue: "€21,000",
    growth: "+12.3%",
    trend: "up",
    clients: 12,
    contracts: 5,
  },
  {
    name: "Auditoría y Control",
    revenue: "€18,650",
    growth: "-2.1%",
    trend: "down",
    clients: 8,
    contracts: 2,
  },
]

export function TopProducts() {
  return (
    <div className="space-y-6">
      {topServices.map((service, index) => (
        <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
              <span className="text-sm font-bold text-primary">#{index + 1}</span>
            </div>
            <div>
              <p className="text-sm font-medium leading-none">{service.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {service.clients} clientes • {service.contracts} contratos
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">{service.revenue}</div>
            <div
              className={`flex items-center text-xs mt-1 ${service.trend === "up" ? "text-green-500" : "text-red-500"}`}
            >
              {service.trend === "up" ? (
                <TrendingUp className="mr-1 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3" />
              )}
              {service.growth}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
