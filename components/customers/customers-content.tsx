"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { CustomersList } from "./customers-list"
import { CreateCustomerForm } from "./create-customer-form"
import { CustomerDetails } from "./customer-details"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  tax_id?: string
  sector?: string
  address?: string
  city?: string
  province?: string
  postal_code?: string
  country?: string
  status?: string
  verifactu_status?: string
  verifactu_synced_at?: string
  created_at: string
  updated_at?: string
}

interface CustomerStats {
  total: number
  thisMonth: number
  lastMonth: number
  growth: number
  byStatus: { pending: number; synced: number; error: number; simulated: number }
  bySector: Array<{ sector: string; count: number }>
}

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

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Consulta directa a Supabase
      const { data, error: fetchError } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false })

      if (fetchError) {
        console.error("[v0] Error Supabase:", fetchError)
        throw new Error(fetchError.message)
      }

      const customerData = data || []
      setCustomers(customerData)
      console.log("[v0] Clientes cargados:", customerData.length)

      // Calcular estadísticas localmente
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

      const thisMonthCount = customerData.filter((c) => new Date(c.created_at) >= thisMonth).length
      const lastMonthCount = customerData.filter((c) => {
        const d = new Date(c.created_at)
        return d >= lastMonth && d < thisMonth
      }).length

      const byStatus = {
        pending: customerData.filter((c) => !c.verifactu_status || c.verifactu_status === "pending").length,
        synced: customerData.filter((c) => c.verifactu_status === "synced").length,
        error: customerData.filter((c) => c.verifactu_status === "error").length,
        simulated: customerData.filter((c) => c.verifactu_status === "simulated").length,
      }

      const sectorCounts: Record<string, number> = {}
      customerData.forEach((c) => {
        const sector = c.sector || "Sin sector"
        sectorCounts[sector] = (sectorCounts[sector] || 0) + 1
      })

      setStats({
        total: customerData.length,
        thisMonth: thisMonthCount,
        lastMonth: lastMonthCount,
        growth: lastMonthCount > 0 ? ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100 : 0,
        byStatus,
        bySector: Object.entries(sectorCounts).map(([sector, count]) => ({ sector, count })),
      })
    } catch (err) {
      console.error("[v0] Error cargando clientes:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes. Verifica la conexión a Supabase.",
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
    setSelectedCustomer(customer)
    setViewMode("details")
  }

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setViewMode("edit")
  }

  const handleDeleteCustomer = async (customer: Customer) => {
    if (!confirm(`¿Eliminar el cliente "${customer.name}"?`)) return

    try {
      const { error: deleteError } = await supabase.from("customers").delete().eq("id", customer.id)

      if (deleteError) throw deleteError

      toast({ title: "Cliente eliminado", description: `${customer.name} ha sido eliminado.` })
      await loadCustomers()
    } catch (err) {
      console.error("[v0] Error eliminando:", err)
      toast({ title: "Error", description: "No se pudo eliminar el cliente.", variant: "destructive" })
    }
  }

  const handleSyncCustomer = async (customer: Customer) => {
    try {
      toast({ title: "Sincronizando...", description: `Sincronizando ${customer.name}...` })

      const response = await fetch("/api/customers/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: customer.id }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Sincronización exitosa",
          description: result.simulated ? "Sincronizado en modo simulación." : "Sincronizado con Verifactu.",
        })
        await loadCustomers()
      } else {
        throw new Error(result.error || "Error en la sincronización")
      }
    } catch (err) {
      console.error("[v0] Error sincronizando:", err)
      toast({ title: "Error", description: "No se pudo sincronizar.", variant: "destructive" })
    }
  }

  const handleCustomerSaved = async () => {
    toast({
      title: viewMode === "create" ? "Cliente creado" : "Cliente actualizado",
      description: "Los cambios se han guardado correctamente.",
    })
    await loadCustomers()
    setViewMode("list")
    setSelectedCustomer(null)
  }

  const handleBackToList = () => {
    setSelectedCustomer(null)
    setViewMode("list")
  }

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
                Volver
              </Button>
              <h2 className="text-2xl font-bold">
                {viewMode === "create" ? "Crear Cliente" : `Editar ${selectedCustomer?.name}`}
              </h2>
            </div>
            <CreateCustomerForm
              customer={selectedCustomer as any}
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
              <Button onClick={handleBackToList}>Volver a la lista</Button>
            </div>
          )
        }
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleBackToList}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <h2 className="text-2xl font-bold">Detalles de {selectedCustomer.name}</h2>
            </div>
            <CustomerDetails customer={selectedCustomer} onEdit={() => handleEditCustomer(selectedCustomer)} />
          </div>
        )

      default:
        return (
          <CustomersList
            customers={customers as any}
            stats={stats as any}
            onCreateCustomer={handleCreateCustomer}
            onViewCustomer={handleViewCustomer as any}
            onEditCustomer={handleEditCustomer as any}
            onDeleteCustomer={handleDeleteCustomer as any}
            onSyncCustomer={handleSyncCustomer as any}
            isLoading={isLoading}
          />
        )
    }
  }

  return <div className="container mx-auto py-6 space-y-6">{renderContent()}</div>
}
