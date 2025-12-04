"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Trash2, Package } from "lucide-react"
import { type Service, SupabaseServiceService } from "@/lib/supabase-services"
import { useState } from "react"

interface ServiceDetailsProps {
  service: Service
  onBack: () => void
  onEdit: () => void
  onDeleted: () => void
}

export function ServiceDetails({ service, onBack, onEdit, onDeleted }: ServiceDetailsProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleDelete = async () => {
    if (!confirm("¿Está seguro de eliminar este servicio?")) return

    setIsDeleting(true)
    const success = await SupabaseServiceService.delete(service.id)
    setIsDeleting(false)

    if (success) {
      onDeleted()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="neu-button-sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h2 className="text-xl font-semibold">Detalles del Servicio</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit} className="neu-button bg-transparent">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="neu-button">
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </div>

      <Card className="neu-card">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <CardTitle className="text-2xl">{service.name}</CardTitle>
              <Badge variant={service.active ? "default" : "secondary"} className="neu-badge">
                {service.active ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <p className="text-muted-foreground font-mono">{service.code}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary">{formatCurrency(service.price)}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Categoría</p>
                <p className="font-medium">{service.category || "Sin categoría"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cliente vinculado (Facturación)</p>
                <p className="font-medium">{service.customer_name || "Sin asignar"}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Fecha de creación</p>
                <p className="font-medium">{formatDate(service.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Última actualización</p>
                <p className="font-medium">{formatDate(service.updated_at)}</p>
              </div>
            </div>
          </div>

          {service.description && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Descripción</p>
              <div className="p-4 rounded-lg bg-muted/30 neu-inset">
                <p className="whitespace-pre-wrap">{service.description}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
