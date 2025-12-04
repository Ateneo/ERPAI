"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, FileDown, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import type { Service } from "@/lib/supabase-services"

interface ServicesListProps {
  services: Service[]
  onSelectService: (service: Service) => void
  onExport?: () => void
}

export function ServicesList({ services, onSelectService, onExport }: ServicesListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  const filteredServices = services.filter((service) => {
    const search = searchTerm.toLowerCase()
    const code = (service.code || "").toLowerCase()
    const name = (service.name || "").toLowerCase()
    const customerName = (service.customer_name || "").toLowerCase()
    return code.includes(search) || name.includes(search) || customerName.includes(search)
  })

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedServices = filteredServices.slice(startIndex, startIndex + itemsPerPage)

  const totalAmount = filteredServices.reduce((sum, s) => sum + (Number.parseFloat(String(s.price)) || 0), 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount)
  }

  return (
    <div className="space-y-4">
      {/* Header con título y acciones */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-sm" />
          <h2 className="text-lg font-semibold">Servicios distintos de formación registrados</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onExport} className="neu-button bg-transparent">
            <FileDown className="h-4 w-4 mr-2" />
            Descargar en Excel
          </Button>
          <Button variant="outline" size="sm" className="neu-button bg-transparent">
            <Filter className="h-4 w-4 mr-2" />
            Búsqueda por filtros
          </Button>
        </div>
      </div>

      {/* Controles de paginación y búsqueda */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="neu-input px-3 py-1.5 text-sm rounded-lg"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-muted-foreground">registros por página</span>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Búsqueda global..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10 neu-input"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="neu-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-20 font-semibold">Nº</TableHead>
              <TableHead className="font-semibold">SERVICIO</TableHead>
              <TableHead className="w-28 text-right font-semibold">PRECIO</TableHead>
              <TableHead className="w-64 font-semibold">FACTURACIÓN</TableHead>
              <TableHead className="w-24 text-center font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No hay servicios registrados
                </TableCell>
              </TableRow>
            ) : (
              paginatedServices.map((service, index) => (
                <TableRow key={service.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                  <TableCell className="font-mono text-primary">{service.code}</TableCell>
                  <TableCell>
                    <span className={service.active ? "text-foreground" : "text-muted-foreground line-through"}>
                      {service.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(Number.parseFloat(String(service.price)) || 0)}
                  </TableCell>
                  <TableCell>
                    {service.customer_name ? (
                      <Badge variant="secondary" className="neu-badge">
                        {service.customer_name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">Sin asignar</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectService(service)}
                      className="neu-button-sm"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Footer con total */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredServices.length)} de{" "}
              {filteredServices.length} registros
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Total:</span>
            <Badge className="neu-badge text-base px-3 py-1">{formatCurrency(totalAmount)}</Badge>
          </div>
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="neu-button-sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm px-4">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="neu-button-sm"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
