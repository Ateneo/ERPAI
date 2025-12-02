"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  FileCheck,
  XCircle,
  Upload,
} from "lucide-react"
import type { Preventa, PreventaStats } from "@/lib/supabase-preventas"

interface PreventasListProps {
  preventas: Preventa[]
  stats: PreventaStats
  onCreatePreventa: () => void
  onViewPreventa: (preventa: Preventa) => void
  onEditPreventa: (preventa: Preventa) => void
  onDeletePreventa: (preventa: Preventa) => void
  onImport: () => void
  isLoading: boolean
}

export function PreventasList({
  preventas,
  stats,
  onCreatePreventa,
  onViewPreventa,
  onEditPreventa,
  onDeletePreventa,
  onImport,
  isLoading,
}: PreventasListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredPreventas = preventas.filter((preventa) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const numero = preventa.numero_presupuesto || ""
      const cliente = preventa.cliente_nombre || ""
      const comercial = preventa.comercial || ""

      const matchesSearch =
        numero.toLowerCase().includes(searchLower) ||
        cliente.toLowerCase().includes(searchLower) ||
        comercial.toLowerCase().includes(searchLower)

      if (!matchesSearch) return false
    }

    if (statusFilter !== "all") {
      if ((preventa.estado || "borrador") !== statusFilter) return false
    }

    return true
  })

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "aprobado":
        return (
          <span className="neu-badge inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
            <CheckCircle className="w-3 h-3" />
            Aprobado
          </span>
        )
      case "facturado":
        return (
          <span className="neu-badge inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
            <FileCheck className="w-3 h-3" />
            Facturado
          </span>
        )
      case "pendiente":
        return (
          <span className="neu-badge inline-flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
            <Clock className="w-3 h-3" />
            Pendiente
          </span>
        )
      case "cancelado":
        return (
          <span className="neu-badge inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
            <XCircle className="w-3 h-3" />
            Cancelado
          </span>
        )
      default:
        return (
          <span className="neu-badge inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300">
            <AlertCircle className="w-3 h-3" />
            Borrador
          </span>
        )
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

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return "-"
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Preventas
          </h1>
          <p className="text-muted-foreground">Gestiona tus presupuestos y preventas de servicios</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onImport} className="neu-button-secondary flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Importar
          </button>
          <button onClick={onCreatePreventa} className="neu-button-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nueva Preventa
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="neu-stat">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-sm font-medium text-muted-foreground">Total Preventas</span>
            <div className="neu-icon-sm">
              <FileText className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="neu-stat-value">{stats.total}</div>
          <p className="text-xs text-muted-foreground">{stats.thisMonth > 0 && `+${stats.thisMonth} este mes`}</p>
        </div>

        <div className="neu-stat">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-sm font-medium text-muted-foreground">Aprobadas</span>
            <div className="neu-icon-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.byStatus.aprobado}</div>
        </div>

        <div className="neu-stat">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-sm font-medium text-muted-foreground">Pendientes</span>
            <div className="neu-icon-sm">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-yellow-600">{stats.byStatus.pendiente}</div>
        </div>

        <div className="neu-stat">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-sm font-medium text-muted-foreground">Facturadas</span>
            <div className="neu-icon-sm">
              <FileCheck className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.byStatus.facturado}</div>
        </div>

        <div className="neu-stat">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-sm font-medium text-muted-foreground">Importe Total</span>
            <div className="neu-icon-sm">
              <FileText className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="text-xl font-bold">{formatCurrency(stats.totalImporte)}</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="neu-card">
        <h3 className="text-lg font-semibold mb-2">Filtros</h3>
        <p className="text-sm text-muted-foreground mb-4">Filtra y busca preventas</p>
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nº presupuesto, cliente o comercial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="neu-input pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 neu-convex border-0">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="neu-dropdown">
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="borrador">Borradores</SelectItem>
              <SelectItem value="pendiente">Pendientes</SelectItem>
              <SelectItem value="aprobado">Aprobados</SelectItem>
              <SelectItem value="facturado">Facturados</SelectItem>
              <SelectItem value="cancelado">Cancelados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de preventas */}
      <div className="neu-table">
        <div className="p-4 border-b border-border/20">
          <h3 className="text-lg font-semibold">Preventas ({filteredPreventas.length})</h3>
          <p className="text-sm text-muted-foreground">Lista de todas las preventas registradas</p>
        </div>
        <div className="p-4">
          {filteredPreventas.length === 0 ? (
            <div className="text-center py-12">
              <div className="neu-icon mx-auto mb-4 w-16 h-16">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No hay preventas</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "No se encontraron preventas con los filtros aplicados."
                  : "Comienza creando tu primera preventa."}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <button onClick={onCreatePreventa} className="neu-button-primary flex items-center gap-2 mx-auto">
                  <Plus className="w-4 h-4" />
                  Crear primera preventa
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto neu-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="neu-table-header">
                    <TableHead className="font-semibold">Nº Presupuesto</TableHead>
                    <TableHead className="font-semibold">Cliente</TableHead>
                    <TableHead className="font-semibold">Comercial</TableHead>
                    <TableHead className="font-semibold">Fecha</TableHead>
                    <TableHead className="font-semibold text-right">Importe</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="text-right font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPreventas.map((preventa) => (
                    <TableRow key={preventa.id} className="neu-table-row">
                      <TableCell>
                        <div className="font-medium">{preventa.numero_presupuesto}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{preventa.cliente_nombre || "-"}</div>
                        <div className="text-sm text-muted-foreground">{preventa.tipo_contrato}</div>
                      </TableCell>
                      <TableCell>{preventa.comercial || "-"}</TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(preventa.fecha_venta)}</div>
                        {preventa.fecha_facturar && (
                          <div className="text-xs text-muted-foreground">
                            Fact: {formatDate(preventa.fecha_facturar)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(preventa.importe_total)}</TableCell>
                      <TableCell>{getStatusBadge(preventa.estado)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onViewPreventa(preventa)}
                            className="neu-icon-sm hover:text-primary transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onEditPreventa(preventa)}
                            className="neu-icon-sm hover:text-primary transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onDeletePreventa(preventa)}
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
