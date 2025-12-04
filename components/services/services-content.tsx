"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Upload, Download } from "lucide-react"
import { ServicesList } from "./services-list"
import { CreateServiceForm } from "./create-service-form"
import { ServiceDetails } from "./service-details"
import { type Service, SupabaseServiceService } from "@/lib/supabase-services"
import Link from "next/link"

type View = "list" | "create" | "edit" | "details"

export function ServicesContent() {
  const [view, setView] = useState<View>("list")
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    setIsLoading(true)
    const data = await SupabaseServiceService.getAll()
    setServices(data)
    setIsLoading(false)
  }

  const handleSelectService = (service: Service) => {
    setSelectedService(service)
    setView("details")
  }

  const handleBack = () => {
    setSelectedService(null)
    setView("list")
  }

  const handleSuccess = () => {
    loadServices()
    setSelectedService(null)
    setView("list")
  }

  const handleEdit = () => {
    setView("edit")
  }

  const handleExport = () => {
    const csv = [
      ["Código", "Servicio", "Precio", "Categoría", "Cliente", "Activo"].join(";"),
      ...services.map((s) =>
        [s.code, s.name, s.price, s.category || "", s.customer_name || "", s.active ? "Sí" : "No"].join(";"),
      ),
    ].join("\n")

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `servicios_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (view === "create") {
    return <CreateServiceForm onBack={handleBack} onSuccess={handleSuccess} />
  }

  if (view === "edit" && selectedService) {
    return <CreateServiceForm service={selectedService} onBack={() => setView("details")} onSuccess={handleSuccess} />
  }

  if (view === "details" && selectedService) {
    return (
      <ServiceDetails service={selectedService} onBack={handleBack} onEdit={handleEdit} onDeleted={handleSuccess} />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Servicios</h1>
          <p className="text-muted-foreground">Gestiona los servicios disponibles</p>
        </div>
        <div className="flex gap-2">
          <Link href="/import/services">
            <Button variant="outline" className="neu-button bg-transparent">
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
          </Link>
          <Button variant="outline" onClick={handleExport} className="neu-button bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setView("create")} className="neu-button-primary">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Servicio
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <ServicesList services={services} onSelectService={handleSelectService} onExport={handleExport} />
      )}
    </div>
  )
}
