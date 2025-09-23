"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Receipt, Calculator, Video, CalendarIcon } from "lucide-react"

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  onEventCreated: (event: any) => void
}

const eventTypes = [
  { value: "contract", label: "Contrato", icon: FileText, color: "text-blue-600" },
  { value: "invoice", label: "Factura", icon: Receipt, color: "text-green-600" },
  { value: "quote", label: "Presupuesto", icon: Calculator, color: "text-orange-600" },
  { value: "meeting", label: "Reunión", icon: Video, color: "text-purple-600" },
  { value: "event", label: "Evento", icon: CalendarIcon, color: "text-gray-600" },
]

const sampleClients = [
  "Academia Superior de Estudios",
  "Construcciones García SL",
  "Hotel Majestic",
  "Restaurante El Buen Sabor",
  "Auditoría Martínez y Asociados",
]

export function CreateEventModal({ isOpen, onClose, onEventCreated }: CreateEventModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    event_date: "",
    event_time: "",
    client_name: "",
    amount: "",
    description: "",
    status: "pending",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validar campos requeridos
      if (!formData.title || !formData.type || !formData.event_date) {
        alert("Por favor, completa todos los campos requeridos (Título, Tipo, Fecha)")
        setIsSubmitting(false)
        return
      }

      const eventData = {
        title: formData.title,
        type: formData.type,
        event_date: formData.event_date,
        event_time: formData.event_time || null,
        client_name: formData.client_name || "Sin cliente",
        amount: formData.amount ? Number.parseFloat(formData.amount) : null,
        description: formData.description || "",
        status: formData.status,
      }

      console.log("Enviando datos del evento:", eventData)

      await onEventCreated(eventData)

      // Reset form
      setFormData({
        title: "",
        type: "",
        event_date: "",
        event_time: "",
        client_name: "",
        amount: "",
        description: "",
        status: "pending",
      })
    } catch (error) {
      console.error("Error en el formulario:", error)
      alert("Error al crear el evento. Por favor, inténtalo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedEventType = eventTypes.find((type) => type.value === formData.type)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Crear Nuevo Evento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">
              Título del Evento <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Ej: Contrato Servicios IT"
              required
            />
          </div>

          <div>
            <Label htmlFor="type">
              Tipo de Evento <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.type} onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo">
                  {selectedEventType && (
                    <div className="flex items-center gap-2">
                      <selectedEventType.icon className={`h-4 w-4 ${selectedEventType.color}`} />
                      {selectedEventType.label}
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${type.color}`} />
                        {type.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="event_date">
                Fecha <span className="text-red-500">*</span>
              </Label>
              <Input
                id="event_date"
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, event_date: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="event_time">Hora (opcional)</Label>
              <Input
                id="event_time"
                type="time"
                value={formData.event_time}
                onChange={(e) => setFormData((prev) => ({ ...prev, event_time: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="client_name">Cliente</Label>
            <Select
              value={formData.client_name}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, client_name: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent>
                {sampleClients.map((client) => (
                  <SelectItem key={client} value={client}>
                    {client}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(formData.type === "invoice" || formData.type === "quote" || formData.type === "contract") && (
            <div>
              <Label htmlFor="amount">Importe (€)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
              />
            </div>
          )}

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción del evento..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="status">Estado</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
                <SelectItem value="scheduled">Programado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear Evento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
