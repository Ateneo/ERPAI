"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { FileText, Receipt, Calculator, Video, CalendarIcon, User, Euro, Clock, FileCheck } from "lucide-react"

interface CalendarEvent {
  id: string
  title: string
  type: "contract" | "invoice" | "quote" | "meeting" | "event"
  date: string
  time?: string
  client: string
  amount?: number
  description: string
  status: string
}

interface EventDetailModalProps {
  event: CalendarEvent
  isOpen: boolean
  onClose: () => void
}

const eventTypes = {
  contract: { color: "bg-blue-500", icon: FileText, label: "Contrato", badgeColor: "bg-blue-100 text-blue-800" },
  invoice: { color: "bg-green-500", icon: Receipt, label: "Factura", badgeColor: "bg-green-100 text-green-800" },
  quote: {
    color: "bg-orange-500",
    icon: Calculator,
    label: "Presupuesto",
    badgeColor: "bg-orange-100 text-orange-800",
  },
  meeting: { color: "bg-purple-500", icon: Video, label: "Reunión", badgeColor: "bg-purple-100 text-purple-800" },
  event: { color: "bg-gray-500", icon: CalendarIcon, label: "Evento", badgeColor: "bg-gray-100 text-gray-800" },
}

export function EventDetailModal({ event, isOpen, onClose }: EventDetailModalProps) {
  const eventType = eventTypes[event.type]
  const Icon = eventType.icon

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`p-2 rounded ${eventType.color} text-white`}>
              <Icon className="h-4 w-4" />
            </div>
            {event.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className={eventType.badgeColor}>{eventType.label}</Badge>
            <Badge variant="outline">{event.status}</Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Fecha:</span>
              <span>{formatDate(event.date)}</span>
            </div>

            {event.time && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Hora:</span>
                <span>{event.time}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Cliente:</span>
              <span>{event.client}</span>
            </div>

            {event.amount && (
              <div className="flex items-center gap-2 text-sm">
                <Euro className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Importe:</span>
                <span className="font-semibold text-green-600">{formatAmount(event.amount)}</span>
              </div>
            )}

            <div className="flex items-start gap-2 text-sm">
              <FileCheck className="h-4 w-4 text-gray-500 mt-0.5" />
              <div>
                <span className="font-medium">Descripción:</span>
                <p className="text-gray-600 mt-1">{event.description}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
