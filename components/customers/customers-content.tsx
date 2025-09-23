"use client"

import { useState, useEffect } from "react"
import { CustomersList } from "./customers-list"
import { CreateCustomerForm } from "./create-customer-form"
import { CustomerDetails } from "./customer-details"
import { type Customer, type CustomerStats, SupabaseCustomerService } from "@/lib/supabase-customers"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type ViewMode = "list" | "create" | "details" | "edit"

export function CustomersContent() {
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stats, setStats] = useState<CustomerStats>({
    total: 0,
    thisMonth: 0,
    lastMonth: 0,
    growth: 0,
    byStatus: { pending: 0, synced: 0, error: 0, simulated: 0 },
    bySector: [],
  })
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Cargar datos iniciales
  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("[CustomersContent] Cargando clientes...")

      // Cargar clientes y estadísticas en paralelo
      const [customersResult, statsResult] = await Promise.all([
        SupabaseCustomerService.getAll(),
        SupabaseCustomerService.getStats(),
      ])

      if (customersResult.success && customersResult.data) {
        setCustomers(customersResult.data)
        console.log(`[CustomersContent] ${customersResult.data.length} clientes cargados`)
      } else {
        throw new Error(customersResult.error || "Error cargando clientes")
      }

      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data)
        console.log("[CustomersContent] Estadísticas cargadas:", statsResult.data)
      } else {
        console.warn("[CustomersContent] Error cargando estadísticas:", statsResult.error)
        // Las estadísticas son opcionales, no fallar por esto
      }
    } catch (error) {
      console.error("[CustomersContent] Error cargando datos:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCustomer = () => {
    setSelectedCustomer(null)
    setViewMode("create")
  }

  const handleViewCustomer = (customer: Customer) => {
    console.log("[CustomersContent] Viendo detalles del cliente:", customer.name)
    setSelectedCustomer(customer)
    setViewMode("details")
  }

  const handleEditCustomer = (customer: Customer) => {
    console.log("[CustomersContent] Editando cliente:", customer.name)
    setSelectedCustomer(customer)
    setViewMode("edit")
  }

  const handleDeleteCustomer = async (customer: Customer) => {
    if (
      !confirm(`¿Estás seguro de que quieres eliminar el cliente "${customer.name}"? Esta acción no se puede deshacer.`)
    ) {
      return
    }

    try {
      console.log("[CustomersContent] Eliminando cliente:", customer.id)

      const result = await SupabaseCustomerService.delete(customer.id)

      if (result.success) {
        toast({
          title: "Cliente eliminado",
          description: `${customer.name} ha sido eliminado exitosamente.`,
        })

        // Recargar la lista
        await loadCustomers()
      } else {
        throw new Error(result.error || "Error eliminando cliente")
      }
    } catch (error) {
      console.error("[CustomersContent] Error eliminando cliente:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente. Inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  const handleSyncCustomer = async (customer: Customer) => {
    try {
      console.log("[CustomersContent] Sincronizando cliente:", customer.id)

      toast({
        title: "Sincronizando...",
        description: `Sincronizando ${customer.name} con Verifactu...`,
      })

      const response = await fetch("/api/customers/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customerId: customer.id }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Sincronización exitosa",
          description: result.simulated
            ? `${customer.name} sincronizado en modo simulación.`
            : `${customer.name} sincronizado con Verifactu.`,
        })

        // Recargar la lista para mostrar el estado actualizado
        await loadCustomers()

        // Si estamos viendo los detalles del cliente, actualizar el cliente seleccionado
        if (selectedCustomer && selectedCustomer.id === customer.id) {
          const updatedCustomerResult = await SupabaseCustomerService.getById(customer.id)
          if (updatedCustomerResult.success && updatedCustomerResult.data) {
            setSelectedCustomer(updatedCustomerResult.data)
          }
        }
      } else {
        throw new Error(result.error || "Error en la sincronización")
      }
    } catch (error) {
      console.error("[CustomersContent] Error sincronizando cliente:", error)
      toast({
        title: "Error de sincronización",
        description: "No se pudo sincronizar el cliente con Verifactu.",
        variant: "destructive",
      })
    }
  }

  const handleCustomerSaved = async (customer: Customer) => {
    console.log("[CustomersContent] Cliente guardado:", customer.id)

    toast({
      title: viewMode === "create" ? "Cliente creado" : "Cliente actualizado",
      description: `${customer.name} ha sido ${viewMode === "create" ? "creado" : "actualizado"} exitosamente.`,
    })

    // Recargar la lista y volver a la vista principal
    await loadCustomers()
    setViewMode("list")
    setSelectedCustomer(null)
  }

  const handleBackToList = () => {
    console.log("[CustomersContent] Volviendo a la lista")
    setSelectedCustomer(null)
    setViewMode("list")
  }

  // Renderizar contenido según el modo de vista
  const renderContent = () => {
    if (error && viewMode === "list") {
      return (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Button onClick={loadCustomers} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </div>
      )
    }

    switch (viewMode) {
      case "create":
      case "edit":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleBackToList}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a la lista
              </Button>
              <h2 className="text-2xl font-bold">
                {viewMode === "create" ? "Crear Cliente" : `Editar ${selectedCustomer?.name}`}
              </h2>
            </div>
            <CreateCustomerForm
              customer={selectedCustomer}
              onSave={handleCustomerSaved}
              onCancel={handleBackToList}
              isEditing={viewMode === "edit"}
            />
          </div>
        )

      case "details":
        if (!selectedCustomer) {
          return (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Cliente no encontrado</h3>
              <p className="text-muted-foreground mb-4">El cliente seleccionado no está disponible.</p>
              <Button onClick={handleBackToList}>Volver a la lista</Button>
            </div>
          )
        }

        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleBackToList}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a la lista
              </Button>
              <h2 className="text-2xl font-bold">Detalles de {selectedCustomer.name}</h2>
            </div>
            <CustomerDetails customerId={selectedCustomer.id} />
          </div>
        )

      default:
        return (
          <CustomersList
            customers={customers}
            stats={stats}
            onCreateCustomer={handleCreateCustomer}
            onViewCustomer={handleViewCustomer}
            onEditCustomer={handleEditCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            onSyncCustomer={handleSyncCustomer}
            isLoading={isLoading}
          />
        )
    }
  }

  return <div className="container mx-auto py-6 space-y-6">{renderContent()}</div>
}
