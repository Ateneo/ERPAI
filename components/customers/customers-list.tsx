"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
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

  // Filtrar clientes
  const filteredCustomers = customers.filter((customer) => {
    // Filtro de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.tax_id.toLowerCase().includes(searchLower) ||
        customer.phone.toLowerCase().includes(searchLower)

      if (!matchesSearch) return false
    }

    // Filtro de estado Verifactu
    if (statusFilter !== "all") {
      if (
        statusFilter === "pending" &&
        customer.verifactu_status !== "pending" &&
        customer.verifactu_status !== null &&
        customer.verifactu_status !== undefined
      ) {
        return false
      } else if (statusFilter !== "pending" && customer.verifactu_status !== statusFilter) {
        return false
      }
    }

    // Filtro de sector
    if (sectorFilter !== "all" && customer.sector !== sectorFilter) {
      return false
    }

    return true
  })

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "synced":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Sincronizado
          </Badge>
        )
      case "simulated":
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">
            <Info className="w-3 h-3 mr-1" />
            Simulado
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        )
      case "error":
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <XCircle className="w-3 h-3 mr-1" />
            No sincronizado
          </Badge>
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-20 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gestiona tus clientes y su sincronización con Verifactu</p>
        </div>
        <Button onClick={onCreateCustomer}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{stats.thisMonth > 0 && `+${stats.thisMonth} este mes`}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sincronizados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.byStatus.synced}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 && `${Math.round((stats.byStatus.synced / stats.total) * 100)}%`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Simulados</CardTitle>
            <Info className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.byStatus.simulated}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 && `${Math.round((stats.byStatus.simulated / stats.total) * 100)}%`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.byStatus.pending}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 && `${Math.round((stats.byStatus.pending / stats.total) * 100)}%`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errores</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.byStatus.error}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 && `${Math.round((stats.byStatus.error / stats.total) * 100)}%`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
          <CardDescription>Filtra y busca clientes en la base de datos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email, NIF o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Estado Verifactu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="synced">Sincronizados</SelectItem>
                <SelectItem value="simulated">Simulados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="error">Con errores</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los sectores</SelectItem>
                {stats.bySector.map((sector) => (
                  <SelectItem key={sector.sector} value={sector.sector}>
                    {sector.sector} ({sector.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes ({filteredCustomers.length})</CardTitle>
          <CardDescription>Lista de todos los clientes registrados</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay clientes</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" || sectorFilter !== "all"
                  ? "No se encontraron clientes con los filtros aplicados."
                  : "Comienza creando tu primer cliente."}
              </p>
              {!searchTerm && statusFilter === "all" && sectorFilter === "all" && (
                <Button onClick={onCreateCustomer}>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear primer cliente
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Estado Verifactu</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.tax_id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{customer.email}</div>
                          <div className="text-sm text-muted-foreground">{customer.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.sector ? (
                          <Badge variant="outline">{customer.sector}</Badge>
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
                          <Button variant="ghost" size="sm" onClick={() => onViewCustomer(customer)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => onEditCustomer(customer)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSyncCustomer(customer)}
                            disabled={syncingCustomers.has(customer.id)}
                          >
                            {syncingCustomers.has(customer.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteCustomer(customer)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
