"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  FileText,
  Receipt,
  Calculator,
  Video,
  CalendarIcon,
  RefreshCw,
} from "lucide-react"
import { EventDetailModal } from "./event-detail-modal"
import { CreateEventModal } from "./create-event-modal"

interface CalendarEvent {
  id: string
  title: string
  type: "contract" | "invoice" | "quote" | "meeting" | "event"
  event_date: string
  event_time?: string
  client_name: string
  client_id?: number
  amount?: number
  description: string
  status: string
  related_id?: number
}

const eventTypes = {
  contract: { color: "bg-blue-500", icon: FileText, label: "Contrato" },
  invoice: { color: "bg-green-500", icon: Receipt, label: "Factura" },
  quote: { color: "bg-orange-500", icon: Calculator, label: "Presupuesto" },
  meeting: { color: "bg-purple-500", icon: Video, label: "Reunión" },
  event: { color: "bg-gray-500", icon: CalendarIcon, label: "Evento" },
}

export function BusinessCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  const today = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const firstDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  // Cargar eventos del mes actual
  useEffect(() => {
    loadCalendarEvents()
  }, [currentDate])

  const loadCalendarEvents = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/calendar-events?month=${month + 1}&year=${year}`)
      const data = await response.json()

      if (data.success) {
        setEvents(data.events)
      } else {
        console.error("Error loading events:", data.error)
      }
    } catch (error) {
      console.error("Error cargando eventos:", error)
    } finally {
      setLoading(false)
    }
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return events.filter((event) => event.event_date === dateStr)
  }

  const handleEventCreated = async (newEventData: any) => {
    try {
      const response = await fetch("/api/calendar-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEventData),
      })

      const data = await response.json()

      if (data.success) {
        setEvents((prev) => [...prev, data.event])
        setShowCreateModal(false)
      } else {
        console.error("Error creating event:", data.error)
      }
    } catch (error) {
      console.error("Error creando evento:", error)
    }
  }

  const renderCalendarDays = () => {
    const days = []

    // Días vacíos del mes anterior
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 p-1"></div>)
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDate(day)
      const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year

      days.push(
        <div
          key={day}
          className={`h-24 p-1 border border-gray-200 ${isToday ? "bg-blue-50" : "bg-white"} hover:bg-gray-50 transition-colors`}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? "text-blue-600" : "text-gray-900"}`}>{day}</div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map((event) => {
              const eventType = eventTypes[event.type]
              const Icon = eventType.icon
              return (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`${eventType.color} text-white text-xs p-1 rounded cursor-pointer hover:opacity-80 flex items-center gap-1 truncate`}
                  title={event.title}
                >
                  <Icon className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{event.title}</span>
                </div>
              )
            })}
            {dayEvents.length > 2 && <div className="text-xs text-gray-500 pl-1">+{dayEvents.length - 2} más</div>}
          </div>
        </div>,
      )
    }

    return days
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando calendario...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendario de Negocio
              <span className="text-sm font-normal text-gray-500">({events.length} eventos)</span>
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadCalendarEvents}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
              <Button onClick={() => setShowCreateModal(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Evento
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-semibold">
                {monthNames[month]} {year}
              </h3>
              <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4 text-sm">
              {Object.entries(eventTypes).map(([key, type]) => {
                const Icon = type.icon
                const count = events.filter((e) => e.type === key).length
                return (
                  <div key={key} className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded ${type.color}`}></div>
                    <Icon className="h-3 w-3" />
                    <span>
                      {type.label} ({count})
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-0 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 border-b">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0 border">{renderCalendarDays()}</div>
        </CardContent>
      </Card>

      {selectedEvent && (
        <EventDetailModal
          event={{
            ...selectedEvent,
            client: selectedEvent.client_name,
            date: selectedEvent.event_date,
            time: selectedEvent.event_time,
          }}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEventCreated={handleEventCreated}
      />
    </>
  )
}
