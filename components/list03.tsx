import { Calendar, PiggyBank, TrendingUp, CreditCard, ArrowRight } from "lucide-react"

const events = [
  {
    id: 1,
    title: "Fondo de Emergencia",
    subtitle: "3 meses de gastos ahorrados",
    icon: PiggyBank,
    status: "En Progreso",
    progress: 65,
    target: 15000,
    date: "Dic 2024",
  },
  {
    id: 2,
    title: "Cartera de Acciones",
    subtitle: "Plan de inversión sector tecnológico",
    icon: TrendingUp,
    status: "Pendiente",
    progress: 30,
    target: 50000,
    date: "Jun 2024",
  },
  {
    id: 3,
    title: "Pago de Deudas",
    subtitle: "Plan de pago préstamo estudiantil",
    icon: CreditCard,
    status: "En Progreso",
    progress: 45,
    target: 25000,
    date: "Mar 2025",
  },
]

const statusColors = {
  Pendiente: "bg-yellow-100 text-yellow-800",
  "En Progreso": "bg-blue-100 text-blue-800",
  Completado: "bg-green-100 text-green-800",
}

export function List03() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Próximos Eventos
        </h2>
      </div>
      <div className="space-x-4 overflow-x-auto flex pb-4">
        {events.map((event) => (
          <div key={event.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 w-72 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                <event.icon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[event.status]}`}>
                {event.status}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{event.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{event.subtitle}</p>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mb-3">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${event.progress}%` }}></div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                €{event.target.toLocaleString()}
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">objetivo</span>
              </span>
              <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="h-3 w-3 mr-1" />
                {event.date}
              </span>
            </div>
            <button className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors flex items-center justify-center">
              Ver Detalles
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
