"use client"

import { useState } from "react"
import { Bell, X, Info, AlertTriangle, CreditCard, TrendingUp, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

// Actualizar las notificaciones
const notifications = [
  {
    id: 1,
    title: "Nueva Funcionalidad",
    message: "¡Echa un vistazo a nuestra nueva herramienta de seguimiento de presupuesto!",
    date: "2023-07-15",
    icon: Info,
    color: "text-blue-500",
  },
  {
    id: 2,
    title: "Alerta de Cuenta",
    message: "Actividad inusual detectada en tu cuenta.",
    date: "2023-07-14",
    icon: AlertTriangle,
    color: "text-yellow-500",
  },
  {
    id: 3,
    title: "Pago Pendiente",
    message: "Tu pago de tarjeta de crédito vence en 3 días.",
    date: "2023-07-13",
    icon: CreditCard,
    color: "text-red-500",
  },
  {
    id: 4,
    title: "Actualización de Inversión",
    message: "Tu cartera de inversiones ha crecido un 5% este mes.",
    date: "2023-07-12",
    icon: TrendingUp,
    color: "text-green-500",
  },
  {
    id: 5,
    title: "Nueva Oferta",
    message: "¡Eres elegible para una nueva cuenta de ahorros con mayor interés!",
    date: "2023-07-11",
    icon: Gift,
    color: "text-purple-500",
  },
]

export function Notifications() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
      </Button>
      {isOpen && (
        <Card className="absolute right-0 mt-2 w-96 z-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            {/* Actualizar el título */}
            <CardTitle className="text-sm font-medium">Notificaciones</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Cerrar notificaciones">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {notifications.map((notification) => (
                <Card key={notification.id} className="mb-4 last:mb-0 border shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className={`${notification.color} p-2 rounded-full bg-opacity-10`}>
                        <notification.icon className={`h-5 w-5 ${notification.color}`} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.date}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
