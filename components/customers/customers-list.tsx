"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Info,
  Loader2,
} from "lucide-react"
import type { Customer, CustomerStats } from "@/lib/supabase-customers"

interface CustomersListProps {
  customers: Customer[]
  stats: CustomerStats
  onCreateCustomer: () => void
  onViewCustomer: (customer: Customer) => void
  onEditCustomer: (customer: Customer) => void
  onDeleteCustomer: (customer: Customer) => void
  onSyncCustomer: (customer: Customer) => void
  isLoading: boolean
}

export function CustomersList({
  customers,
  stats,
  onCreateCustomer,
  onViewCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onSyncCustomer,
  isLoading,
}: CustomersListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sectorFilter, setSectorFilter] = useState<string>("all")
  const [syncingCustomers, setSyncingCustomers] = useState<Set<string>>(new Set())

  const filteredCustomers = customers.filter((customer) => {
    // Filtro de búsqueda simplificado - solo campos que siempre existen
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const name = customer.name || ""
      const email = customer.email || ""
      const taxId = customer.tax_id || ""
      const phone = customer.phone || ""

      const matchesSearch =
        name.toLowerCase().includes(searchLower) ||
        email.toLowerCase().includes(searchLower) ||
        taxId.toLowerCase().includes(searchLower) ||
        phone.toLowerCase().includes(searchLower)

      if (!matchesSearch) return false
    }

    // Filtro por estado
    if (statusFilter !== "all") {
      const customerStatus = customer.verifactu_status || "pending"
      if (statusFilter !== customerStatus) return false
    }

    // Filtro por sector
    if (sectorFilter !== "all") {
      if ((customer.sector || "") !== sectorFilter) return false
    }

    return true
  })

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "synced":
        return (
          <span className="neu-badge inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
            <CheckCircle className="w-3 h-3" />
            Sincronizado
          </span>
        )
      case "simulated":
        return (
          <span className="neu-badge inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
            <Info className="w-3 h-3" />
            Simulado
          </span>
        )
      case "pending":
        return (
          <span className="neu-badge inline-flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
            <Clock className="w-3 h-3" />
            Pendiente
          </span>
        )
      case "error":
        return (
          <span className="neu-badge inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
            <AlertCircle className="w-3 h-3" />
            Error
          </span>
        )
      default:
        return (
          <span className="neu-badge inline-flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            No sincronizado
          </span>
        )
    }
  }

  const handleSyncCustomer = async (customer: Customer) => {
    setSyncingCustomers((prev) => new Set(prev).add(customer.id))
    try {
      await onSyncCustomer(customer)
    } finally {
      setSyncingCustomers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(customer.id)
        return newSet
      })
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="neu-skeleton h-8 w-48 rounded-lg" />
            <div className="neu-skeleton h-4 w-64 mt-2 rounded-lg" />
          </div>
          <div className="neu-skeleton h-10 w-32 rounded-lg" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="neu-card">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="neu-skeleton h-4 w-24 rounded-lg" />
                <div className="neu-skeleton h-4 w-4 rounded-full" />
              </div>
              <div className="neu-skeleton h-8 w-16 mt-2 rounded-lg" />
              <div className="neu-skeleton h-3 w-20 mt-2 rounded-lg" />
            </div>
          ))}
        </div>

        <div className="neu-card">
          <div className="neu-skeleton h-6 w-32 mb-4 rounded-lg" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="neu-skeleton h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Clientes
          </h1>
          <p className="text-muted-foreground">Gestiona tus clientes y su sincronización con Verifactu</p>
        </div>
        <button onClick={onCreateCustomer} className="neu-button-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Cliente
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="neu-stat">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-sm font-medium text-muted-foreground">Total Clientes</span>
            <div className="neu-icon-sm">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="neu-stat-value">{stats.total}</div>
          <p className="text-xs text-muted-foreground">{stats.thisMonth > 0 && `+${stats.thisMonth} este mes`}</p>
        </div>

        <div className="neu-stat">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-sm font-medium text-muted-foreground">Sincronizados</span>
            <div className="neu-icon-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.byStatus.synced}</div>
          <p className="text-xs text-muted-foreground">
            {stats.total > 0 && `${Math.round((stats.byStatus.synced / stats.total) * 100)}%`}
          </p>
        </div>

        <div className="neu-stat">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-sm font-medium text-muted-foreground">Simulados</span>
            <div className="neu-icon-sm">
              <Info className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.byStatus.simulated}</div>
          <p className="text-xs text-muted-foreground">
            {stats.total > 0 && `${Math.round((stats.byStatus.simulated / stats.total) * 100)}%`}
          </p>
        </div>

        <div className="neu-stat">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-sm font-medium text-muted-foreground">Pendientes</span>
            <div className="neu-icon-sm">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-yellow-600">{stats.byStatus.pending}</div>
          <p className="text-xs text-muted-foreground">
            {stats.total > 0 && `${Math.round((stats.byStatus.pending / stats.total) * 100)}%`}
          </p>
        </div>

        <div className="neu-stat">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-sm font-medium text-muted-foreground">Errores</span>
            <div className="neu-icon-sm">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.byStatus.error}</div>
          <p className="text-xs text-muted-foreground">
            {stats.total > 0 && `${Math.round((stats.byStatus.error / stats.total) * 100)}%`}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="neu-card">
        <h3 className="text-lg font-semibold mb-2">Filtros</h3>
        <p className="text-sm text-muted-foreground mb-4">Filtra y busca clientes en la base de datos</p>
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nombre, email, NIF o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="neu-input pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 neu-convex border-0">
              <SelectValue placeholder="Estado Verifactu" />
            </SelectTrigger>
            <SelectContent className="neu-dropdown">
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="synced">Sincronizados</SelectItem>
              <SelectItem value="simulated">Simulados</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="error">Con errores</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger className="w-48 neu-convex border-0">
              <SelectValue placeholder="Sector" />
            </SelectTrigger>
            <SelectContent className="neu-dropdown">
              <SelectItem value="all">Todos los sectores</SelectItem>
              {stats.bySector.map((sector) => (
                <SelectItem key={sector.sector} value={sector.sector}>
                  {sector.sector} ({sector.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="neu-table">
        <div className="p-4 border-b border-border/20">
          <h3 className="text-lg font-semibold">Clientes ({filteredCustomers.length})</h3>
          <p className="text-sm text-muted-foreground">Lista de todos los clientes registrados</p>
        </div>
        <div className="p-4">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <div className="neu-icon mx-auto mb-4 w-16 h-16">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No hay clientes</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" || sectorFilter !== "all"
                  ? "No se encontraron clientes con los filtros aplicados."
                  : "Comienza creando tu primer cliente."}
              </p>
              {!searchTerm && statusFilter === "all" && sectorFilter === "all" && (
                <button onClick={onCreateCustomer} className="neu-button-primary flex items-center gap-2 mx-auto">
                  <Plus className="w-4 h-4" />
                  Crear primer cliente
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto neu-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="neu-table-header">
                    <TableHead className="font-semibold">Cliente</TableHead>
                    <TableHead className="font-semibold">Contacto</TableHead>
                    <TableHead className="font-semibold">Sector</TableHead>
                    <TableHead className="font-semibold">Estado Verifactu</TableHead>
                    <TableHead className="font-semibold">Fecha</TableHead>
                    <TableHead className="text-right font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="neu-table-row">
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.name || "Sin nombre"}</div>
                          <div className="text-sm text-muted-foreground">{customer.tax_id || "-"}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{customer.email || "-"}</div>
                          <div className="text-sm text-muted-foreground">{customer.phone || "-"}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.sector ? (
                          <span className="neu-badge">{customer.sector}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(customer.verifactu_status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(customer.created_at)}</div>
                        {customer.verifactu_synced_at && (
                          <div className="text-xs text-muted-foreground">
                            Sync: {formatDate(customer.verifactu_synced_at)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onViewCustomer(customer)}
                            className="neu-icon-sm hover:text-primary transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onEditCustomer(customer)}
                            className="neu-icon-sm hover:text-primary transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleSyncCustomer(customer)}
                            disabled={syncingCustomers.has(customer.id)}
                            className="neu-icon-sm hover:text-primary transition-colors disabled:opacity-50"
                          >
                            {syncingCustomers.has(customer.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => onDeleteCustomer(customer)}
                            className="neu-icon-sm hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
