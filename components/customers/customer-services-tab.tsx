"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, FileText, Package, Save, X, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import {
  CustomerServicesService,
  type CustomerService,
  type ServiceLine,
  type ServiceComplement,
} from "@/lib/supabase-customer-services"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface Service {
  id: string
  code: string
  name: string
  price: number
}

interface CustomerServicesTabProps {
  customerId: string
  customerName: string
}

const COMERCIALES = ["PATRICIA BLASCO", "JUAN GARCÍA", "MARÍA LÓPEZ", "CARLOS MARTÍNEZ", "ANA RODRÍGUEZ"]

const TIPOS_VENCIMIENTO = ["En la fecha", "Fin de mes", "15 días", "30 días", "60 días", "90 días"]

export function CustomerServicesTab({ customerId, customerName }: CustomerServicesTabProps) {
  const [preventas, setPreventas] = useState<CustomerService[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPreventa, setEditingPreventa] = useState<CustomerService | null>(null)

  // Form state
  const [formData, setFormData] = useState<Partial<CustomerService>>({
    customer_id: customerId,
    fecha_venta: new Date().toISOString().split("T")[0],
    tipo_vencimiento: "En la fecha",
    tipo_contrato: "cliente",
    tiempo_contrato: "ano",
    estado: "borrador",
    comercial: "",
    colaborador: "",
    telemarketing: "",
    observaciones_factura: "",
  })

  const [serviceLines, setServiceLines] = useState<ServiceLine[]>([])
  const [complements, setComplements] = useState<ServiceComplement[]>([])

  useEffect(() => {
    loadData()
  }, [customerId])

  const loadData = async () => {
    setLoading(true)

    // Cargar preventas del cliente
    const preventasData = await CustomerServicesService.getByCustomerId(customerId)
    setPreventas(preventasData)

    // Cargar servicios disponibles
    const { data: servicesData } = await supabase
      .from("services")
      .select("id, code, name, price")
      .eq("active", true)
      .order("code")

    setServices(servicesData || [])
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      customer_id: customerId,
      fecha_venta: new Date().toISOString().split("T")[0],
      tipo_vencimiento: "En la fecha",
      tipo_contrato: "cliente",
      tiempo_contrato: "ano",
      estado: "borrador",
      comercial: "",
      colaborador: "",
      telemarketing: "",
      observaciones_factura: "",
    })
    setServiceLines([])
    setComplements([])
    setEditingPreventa(null)
  }

  const openNewPreventa = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditPreventa = async (preventa: CustomerService) => {
    const fullPreventa = await CustomerServicesService.getById(preventa.id!)
    if (fullPreventa) {
      setEditingPreventa(fullPreventa)
      setFormData({
        customer_id: fullPreventa.customer_id,
        fecha_venta: fullPreventa.fecha_venta,
        fecha_facturar: fullPreventa.fecha_facturar || "",
        tipo_vencimiento: fullPreventa.tipo_vencimiento,
        fecha_vencimiento: fullPreventa.fecha_vencimiento || "",
        tipo_contrato: fullPreventa.tipo_contrato,
        tiempo_contrato: fullPreventa.tiempo_contrato,
        estado: fullPreventa.estado,
        comercial: fullPreventa.comercial || "",
        colaborador: fullPreventa.colaborador || "",
        telemarketing: fullPreventa.telemarketing || "",
        observaciones_factura: fullPreventa.observaciones_factura || "",
      })
      setServiceLines(fullPreventa.lines || [])
      setComplements(fullPreventa.complements || [])
      setIsDialogOpen(true)
    }
  }

  const addServiceLine = () => {
    setServiceLines([
      ...serviceLines,
      {
        service_code: "",
        service_name: "",
        precio_unitario: 0,
        unidades: 1,
        total: 0,
      },
    ])
  }

  const removeServiceLine = (index: number) => {
    setServiceLines(serviceLines.filter((_, i) => i !== index))
  }

  const updateServiceLine = (index: number, field: keyof ServiceLine, value: any) => {
    const updated = [...serviceLines]
    updated[index] = { ...updated[index], [field]: value }

    // Recalcular total si cambia precio o unidades
    if (field === "precio_unitario" || field === "unidades") {
      updated[index].total = updated[index].precio_unitario * updated[index].unidades
    }

    setServiceLines(updated)
  }

  const selectService = (index: number, serviceId: string) => {
    const service = services.find((s) => s.id === serviceId)
    if (service) {
      const updated = [...serviceLines]
      updated[index] = {
        ...updated[index],
        service_id: service.id,
        service_code: service.code,
        service_name: service.name,
        precio_unitario: service.price,
        total: service.price * updated[index].unidades,
      }
      setServiceLines(updated)
    }
  }

  const addComplement = () => {
    setComplements([
      ...complements,
      {
        complemento: "",
        precio: 0,
        observaciones: "",
      },
    ])
  }

  const removeComplement = (index: number) => {
    setComplements(complements.filter((_, i) => i !== index))
  }

  const updateComplement = (index: number, field: keyof ServiceComplement, value: any) => {
    const updated = [...complements]
    updated[index] = { ...updated[index], [field]: value }
    setComplements(updated)
  }

  const calculateTotal = () => {
    const servicesTotal = serviceLines.reduce((sum, line) => sum + (line.total || 0), 0)
    const complementsTotal = complements.reduce((sum, comp) => sum + (comp.precio || 0), 0)
    return servicesTotal + complementsTotal
  }

  const handleSubmit = async () => {
    const preventaData: Omit<CustomerService, "id" | "created_at" | "updated_at"> = {
      ...(formData as any),
      customer_id: customerId,
      importe_total: calculateTotal(),
      lines: serviceLines,
      complements: complements,
    }

    let result
    if (editingPreventa) {
      result = await CustomerServicesService.update(editingPreventa.id!, preventaData)
    } else {
      result = await CustomerServicesService.create(preventaData)
    }

    if (result) {
      setIsDialogOpen(false)
      resetForm()
      loadData()
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Está seguro de eliminar esta preventa?")) {
      await CustomerServicesService.delete(id)
      loadData()
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "aprobada":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprobada
          </Badge>
        )
      case "pendiente":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        )
      case "facturada":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <FileText className="w-3 h-3 mr-1" />
            Facturada
          </Badge>
        )
      case "cancelada":
        return (
          <Badge className="bg-red-100 text-red-800">
            <X className="w-3 h-3 mr-1" />
            Cancelada
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Borrador
          </Badge>
        )
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-ES")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">Total Preventas</div>
            <div className="text-2xl font-bold">{preventas.length}</div>
          </Card>
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">Importe Total</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(preventas.reduce((sum, p) => sum + (p.importe_total || 0), 0))}
            </div>
          </Card>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewPreventa}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Preventa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPreventa ? "Editar Preventa de Servicios" : "Gestión de Preventa de Servicios"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Info básica */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cliente</Label>
                  <Input value={customerName} disabled className="bg-muted" />
                </div>
                <div>
                  <Label>Colaborador</Label>
                  <Select
                    value={formData.colaborador}
                    onValueChange={(v) => setFormData({ ...formData, colaborador: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {COMERCIALES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fecha de venta</Label>
                  <Input
                    type="date"
                    value={formData.fecha_venta}
                    onChange={(e) => setFormData({ ...formData, fecha_venta: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Telemarketing</Label>
                  <Select
                    value={formData.telemarketing}
                    onValueChange={(v) => setFormData({ ...formData, telemarketing: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {COMERCIALES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fecha para facturar</Label>
                  <Input
                    type="date"
                    value={formData.fecha_facturar || ""}
                    onChange={(e) => setFormData({ ...formData, fecha_facturar: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Tipo de vencimiento</Label>
                  <Select
                    value={formData.tipo_vencimiento}
                    onValueChange={(v) => setFormData({ ...formData, tipo_vencimiento: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_VENCIMIENTO.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fecha vencimiento</Label>
                  <Input
                    type="date"
                    value={formData.fecha_vencimiento || ""}
                    onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Comercial</Label>
                  <Select value={formData.comercial} onValueChange={(v) => setFormData({ ...formData, comercial: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {COMERCIALES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tipo de contrato */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de contrato</Label>
                  <RadioGroup
                    value={formData.tipo_contrato}
                    onValueChange={(v) => setFormData({ ...formData, tipo_contrato: v })}
                    className="flex gap-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cliente" id="cliente" />
                      <Label htmlFor="cliente">Cliente</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="colaborador" id="colaborador" />
                      <Label htmlFor="colaborador">Colaborador</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label>Tiempo de contrato</Label>
                  <RadioGroup
                    value={formData.tiempo_contrato}
                    onValueChange={(v) => setFormData({ ...formData, tiempo_contrato: v })}
                    className="flex gap-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ano" id="ano" />
                      <Label htmlFor="ano">Año</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ano_mantenimiento" id="ano_mantenimiento" />
                      <Label htmlFor="ano_mantenimiento">Año y mantenimiento</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Servicios */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base font-semibold">Servicio/s</Label>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">SERVICIO</TableHead>
                      <TableHead>PRECIO/UD.</TableHead>
                      <TableHead>UNIDADES</TableHead>
                      <TableHead>TOTAL</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceLines.map((line, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Select value={line.service_id || ""} onValueChange={(v) => selectService(index, v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar servicio..." />
                            </SelectTrigger>
                            <SelectContent>
                              {services.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                  {s.code} - {s.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={line.precio_unitario}
                              onChange={(e) =>
                                updateServiceLine(index, "precio_unitario", Number.parseFloat(e.target.value) || 0)
                              }
                              className="w-24"
                            />
                            <span>€</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={line.unidades}
                            onChange={(e) => updateServiceLine(index, "unidades", Number.parseInt(e.target.value) || 1)}
                            className="w-20"
                            min={1}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Input value={line.total.toFixed(2)} disabled className="w-24 bg-muted" />
                            <span>€</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeServiceLine(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addServiceLine}
                    className="text-green-600 border-green-600 bg-transparent"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Añadir servicio
                  </Button>
                </div>
              </div>

              {/* Complementos */}
              <div>
                <Label className="text-base font-semibold">Complemento/s</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">COMPLEMENTO</TableHead>
                      <TableHead>PRECIO</TableHead>
                      <TableHead>OBSERVACIONES</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complements.map((comp, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            value={comp.complemento}
                            onChange={(e) => updateComplement(index, "complemento", e.target.value)}
                            placeholder="Nombre del complemento"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={comp.precio}
                              onChange={(e) =>
                                updateComplement(index, "precio", Number.parseFloat(e.target.value) || 0)
                              }
                              className="w-24"
                            />
                            <span>€</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Textarea
                            value={comp.observaciones || ""}
                            onChange={(e) => updateComplement(index, "observaciones", e.target.value)}
                            rows={1}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeComplement(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addComplement}
                    className="text-green-600 border-green-600 bg-transparent"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Añadir complemento
                  </Button>
                </div>
              </div>

              {/* Importe total */}
              <div className="flex items-center gap-2">
                <Label className="font-semibold">Importe total:</Label>
                <div className="flex items-center gap-1 bg-muted px-3 py-2 rounded">
                  <span className="text-xl font-bold">{calculateTotal().toFixed(2)}</span>
                  <span>€</span>
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <Label className="text-base font-semibold">Observaciones para factura</Label>
                <Textarea
                  value={formData.observaciones_factura || ""}
                  onChange={(e) => setFormData({ ...formData, observaciones_factura: e.target.value })}
                  rows={4}
                  className="mt-2"
                  placeholder="Observaciones adicionales..."
                />
              </div>

              {/* Estado */}
              <div>
                <Label>Estado</Label>
                <Select value={formData.estado} onValueChange={(v) => setFormData({ ...formData, estado: v })}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="borrador">Borrador</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="aprobada">Aprobada</SelectItem>
                    <SelectItem value="facturada">Facturada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Volver
                </Button>
                <Button onClick={handleSubmit}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Listado de preventas */}
      {preventas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Sin preventas de servicios</h3>
            <p className="text-muted-foreground text-center mb-4">Este cliente aún no tiene servicios contratados.</p>
            <Button onClick={openNewPreventa}>
              <Plus className="w-4 h-4 mr-2" />
              Crear primera preventa
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nº Presupuesto</TableHead>
              <TableHead>Fecha Venta</TableHead>
              <TableHead>Comercial</TableHead>
              <TableHead>Servicios</TableHead>
              <TableHead>Importe</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preventas.map((preventa) => (
              <TableRow key={preventa.id}>
                <TableCell className="font-medium">{preventa.numero_presupuesto}</TableCell>
                <TableCell>{formatDate(preventa.fecha_venta)}</TableCell>
                <TableCell>{preventa.comercial || "-"}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{preventa.lines?.length || 0} servicios</Badge>
                </TableCell>
                <TableCell className="font-semibold">{formatCurrency(preventa.importe_total || 0)}</TableCell>
                <TableCell>{getEstadoBadge(preventa.estado)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditPreventa(preventa)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(preventa.id!)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
