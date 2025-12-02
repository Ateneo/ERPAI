"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Trash2, Save, ArrowLeft, Search, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PreventaInput, PreventaService, PreventaComplemento } from "@/lib/supabase-preventas"

interface CreatePreventaFormProps {
  onSubmit: (data: PreventaInput) => Promise<void>
  onCancel: () => void
  initialData?: Partial<PreventaInput>
  isEditing?: boolean
}

const COMERCIALES = ["PATRICIA BLASCO", "JUAN GARCÍA", "MARÍA LÓPEZ", "CARLOS MARTÍN", "ANA FERNÁNDEZ"]

const TIPOS_VENCIMIENTO = ["En la fecha", "30 días", "60 días", "90 días", "Fin de mes", "Fin de mes + 30"]

const SERVICIOS_DISPONIBLES = [
  { codigo: "SIB001", nombre: "IMPLANTACIÓN PROTECCIÓN", precio: 420.0 },
  { codigo: "SIB002", nombre: "MANTENIMIENTO ANUAL", precio: 180.0 },
  { codigo: "SIB003", nombre: "CONSULTORÍA RGPD", precio: 350.0 },
  { codigo: "SIB004", nombre: "AUDITORÍA DE SEGURIDAD", precio: 500.0 },
  { codigo: "SIB005", nombre: "FORMACIÓN EMPLEADOS", precio: 250.0 },
]

export function CreatePreventaForm({ onSubmit, onCancel, initialData, isEditing = false }: CreatePreventaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<PreventaInput>>({
    numero_presupuesto: "",
    cliente_nombre: "",
    colaborador: "",
    telemarketing: "",
    fecha_venta: new Date().toISOString().split("T")[0],
    fecha_facturar: "",
    tipo_vencimiento: "En la fecha",
    fecha_vencimiento: "",
    comercial: "",
    tipo_contrato: "cliente",
    tiempo_contrato: "año",
    importe_total: 0,
    observaciones: "",
    estado: "borrador",
    ...initialData,
  })

  const [servicios, setServicios] = useState<Omit<PreventaService, "id" | "preventa_id" | "created_at">[]>(
    initialData?.servicios || [],
  )
  const [complementos, setComplementos] = useState<Omit<PreventaComplemento, "id" | "preventa_id" | "created_at">[]>(
    initialData?.complementos || [],
  )

  // Calculate total
  useEffect(() => {
    const serviciosTotal = servicios.reduce((sum, s) => sum + (s.total || 0), 0)
    const complementosTotal = complementos.reduce((sum, c) => sum + (c.precio || 0), 0)
    setFormData((prev) => ({
      ...prev,
      importe_total: serviciosTotal + complementosTotal,
    }))
  }, [servicios, complementos])

  const handleAddServicio = () => {
    setServicios([...servicios, { servicio: "", precio_unitario: 0, unidades: 1, total: 0 }])
  }

  const handleRemoveServicio = (index: number) => {
    setServicios(servicios.filter((_, i) => i !== index))
  }

  const handleServicioChange = (index: number, field: string, value: string | number) => {
    const updated = [...servicios]
    updated[index] = { ...updated[index], [field]: value }

    // Recalculate total
    if (field === "precio_unitario" || field === "unidades") {
      updated[index].total = updated[index].precio_unitario * updated[index].unidades
    }

    // If selecting a predefined service, fill in the price
    if (field === "servicio") {
      const predefined = SERVICIOS_DISPONIBLES.find((s) => `${s.codigo} - ${s.nombre}` === value)
      if (predefined) {
        updated[index].precio_unitario = predefined.precio
        updated[index].total = predefined.precio * updated[index].unidades
      }
    }

    setServicios(updated)
  }

  const handleAddComplemento = () => {
    setComplementos([...complementos, { complemento: "", precio: 0, observaciones: "" }])
  }

  const handleRemoveComplemento = (index: number) => {
    setComplementos(complementos.filter((_, i) => i !== index))
  }

  const handleComplementoChange = (index: number, field: string, value: string | number) => {
    const updated = [...complementos]
    updated[index] = { ...updated[index], [field]: value }
    setComplementos(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit({
        ...formData,
        servicios,
        complementos,
      } as PreventaInput)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onCancel} className="neu-icon-sm">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {isEditing ? "Editar Preventa" : "Nueva Preventa"}
            </h2>
            <p className="text-sm text-muted-foreground">Gestión de preventa de servicios</p>
          </div>
        </div>
      </div>

      {/* Datos principales */}
      <div className="neu-card">
        <h3 className="text-lg font-semibold mb-4">Datos de la Preventa</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Nº Presupuesto */}
          <div>
            <label className="block text-sm font-medium mb-1">Nº Presupuesto</label>
            <input
              type="text"
              value={formData.numero_presupuesto}
              onChange={(e) => setFormData({ ...formData, numero_presupuesto: e.target.value })}
              placeholder="PRE-2025-0001"
              className="neu-input"
            />
            <p className="text-xs text-muted-foreground mt-1">Se genera automáticamente si se deja vacío</p>
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Cliente <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.cliente_nombre}
                onChange={(e) => setFormData({ ...formData, cliente_nombre: e.target.value })}
                placeholder="Nombre del cliente"
                className="neu-input pr-10"
                required
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Colaborador */}
          <div>
            <label className="block text-sm font-medium mb-1">Colaborador</label>
            <input
              type="text"
              value={formData.colaborador}
              onChange={(e) => setFormData({ ...formData, colaborador: e.target.value })}
              placeholder="Colaborador"
              className="neu-input"
            />
          </div>

          {/* Fecha de venta */}
          <div>
            <label className="block text-sm font-medium mb-1">Fecha de venta</label>
            <input
              type="date"
              value={formData.fecha_venta}
              onChange={(e) => setFormData({ ...formData, fecha_venta: e.target.value })}
              className="neu-input"
            />
          </div>

          {/* Telemarketing */}
          <div>
            <label className="block text-sm font-medium mb-1">Telemarketing</label>
            <input
              type="text"
              value={formData.telemarketing}
              onChange={(e) => setFormData({ ...formData, telemarketing: e.target.value })}
              placeholder="Telemarketing"
              className="neu-input"
            />
          </div>

          {/* Fecha para facturar */}
          <div>
            <label className="block text-sm font-medium mb-1">Fecha para facturar</label>
            <input
              type="date"
              value={formData.fecha_facturar}
              onChange={(e) => setFormData({ ...formData, fecha_facturar: e.target.value })}
              className="neu-input"
            />
          </div>

          {/* Tipo de vencimiento */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Tipo de vencimiento <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.tipo_vencimiento}
              onValueChange={(value) => setFormData({ ...formData, tipo_vencimiento: value })}
            >
              <SelectTrigger className="neu-convex border-0">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent className="neu-dropdown">
                {TIPOS_VENCIMIENTO.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fecha vencimiento */}
          <div>
            <label className="block text-sm font-medium mb-1">Fecha vencimiento</label>
            <input
              type="date"
              value={formData.fecha_vencimiento}
              onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
              className="neu-input"
            />
          </div>

          {/* Comercial */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Comercial <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.comercial}
              onValueChange={(value) => setFormData({ ...formData, comercial: value })}
            >
              <SelectTrigger className="neu-convex border-0">
                <SelectValue placeholder="Seleccionar comercial" />
              </SelectTrigger>
              <SelectContent className="neu-dropdown">
                {COMERCIALES.map((comercial) => (
                  <SelectItem key={comercial} value={comercial}>
                    {comercial}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tipo de contrato */}
        <div className="mt-4 flex flex-wrap gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Tipo de contrato <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tipo_contrato"
                  value="cliente"
                  checked={formData.tipo_contrato === "cliente"}
                  onChange={() => setFormData({ ...formData, tipo_contrato: "cliente" })}
                  className="neu-radio"
                />
                <span>Cliente</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tipo_contrato"
                  value="colaborador"
                  checked={formData.tipo_contrato === "colaborador"}
                  onChange={() => setFormData({ ...formData, tipo_contrato: "colaborador" })}
                  className="neu-radio"
                />
                <span>Colaborador</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Tiempo de contrato <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tiempo_contrato"
                  value="año"
                  checked={formData.tiempo_contrato === "año"}
                  onChange={() => setFormData({ ...formData, tiempo_contrato: "año" })}
                  className="neu-radio"
                />
                <span>Año</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tiempo_contrato"
                  value="año_mantenimiento"
                  checked={formData.tiempo_contrato === "año_mantenimiento"}
                  onChange={() => setFormData({ ...formData, tiempo_contrato: "año_mantenimiento" })}
                  className="neu-radio"
                />
                <span>Año y mantenimiento</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Servicios */}
      <div className="neu-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Servicio/s</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/20">
                <th className="text-left py-2 px-2 font-medium text-sm">SERVICIO</th>
                <th className="text-right py-2 px-2 font-medium text-sm">PRECIO/UD.</th>
                <th className="text-right py-2 px-2 font-medium text-sm w-24">UNIDADES</th>
                <th className="text-right py-2 px-2 font-medium text-sm">TOTAL</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((servicio, index) => (
                <tr key={index} className="border-b border-border/10">
                  <td className="py-2 px-2">
                    <Select
                      value={servicio.servicio}
                      onValueChange={(value) => handleServicioChange(index, "servicio", value)}
                    >
                      <SelectTrigger className="neu-convex border-0 min-w-[250px]">
                        <SelectValue placeholder="Seleccionar servicio" />
                      </SelectTrigger>
                      <SelectContent className="neu-dropdown">
                        {SERVICIOS_DISPONIBLES.map((s) => (
                          <SelectItem key={s.codigo} value={`${s.codigo} - ${s.nombre}`}>
                            {s.codigo} - {s.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex items-center justify-end gap-1">
                      <input
                        type="number"
                        value={servicio.precio_unitario}
                        onChange={(e) =>
                          handleServicioChange(index, "precio_unitario", Number.parseFloat(e.target.value) || 0)
                        }
                        className="neu-input w-24 text-right"
                        step="0.01"
                      />
                      <span className="text-muted-foreground">€</span>
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      value={servicio.unidades}
                      onChange={(e) => handleServicioChange(index, "unidades", Number.parseInt(e.target.value) || 1)}
                      className="neu-input w-20 text-right"
                      min="1"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex items-center justify-end gap-1">
                      <span className="font-medium">{servicio.total.toFixed(2)}</span>
                      <span className="text-muted-foreground">€</span>
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    <button
                      type="button"
                      onClick={() => handleRemoveServicio(index)}
                      className="neu-icon-sm hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={handleAddServicio}
            className="neu-button-secondary flex items-center gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            Añadir servicio
          </button>
          {servicios.length > 0 && (
            <button
              type="button"
              onClick={() => setServicios([])}
              className="neu-button-danger flex items-center gap-2 text-sm"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar servicio
            </button>
          )}
        </div>
      </div>

      {/* Complementos */}
      <div className="neu-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Complemento/s</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/20">
                <th className="text-left py-2 px-2 font-medium text-sm">COMPLEMENTO</th>
                <th className="text-right py-2 px-2 font-medium text-sm">PRECIO</th>
                <th className="text-left py-2 px-2 font-medium text-sm">OBSERVACIONES</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {complementos.map((complemento, index) => (
                <tr key={index} className="border-b border-border/10">
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={complemento.complemento}
                      onChange={(e) => handleComplementoChange(index, "complemento", e.target.value)}
                      className="neu-input min-w-[200px]"
                      placeholder="Nombre del complemento"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex items-center justify-end gap-1">
                      <input
                        type="number"
                        value={complemento.precio}
                        onChange={(e) =>
                          handleComplementoChange(index, "precio", Number.parseFloat(e.target.value) || 0)
                        }
                        className="neu-input w-24 text-right"
                        step="0.01"
                      />
                      <span className="text-muted-foreground">€</span>
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={complemento.observaciones || ""}
                      onChange={(e) => handleComplementoChange(index, "observaciones", e.target.value)}
                      className="neu-input"
                      placeholder="Observaciones"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <button
                      type="button"
                      onClick={() => handleRemoveComplemento(index)}
                      className="neu-icon-sm hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={handleAddComplemento}
            className="neu-button-secondary flex items-center gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            Añadir complemento
          </button>
          {complementos.length > 0 && (
            <button
              type="button"
              onClick={() => setComplementos([])}
              className="neu-button-danger flex items-center gap-2 text-sm"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar complemento
            </button>
          )}
        </div>

        {/* Importe Total */}
        <div className="mt-6 flex justify-end">
          <div className="neu-convex px-6 py-3 rounded-xl">
            <span className="text-sm text-muted-foreground mr-4">Importe total:</span>
            <span className="text-2xl font-bold">{formData.importe_total?.toFixed(2)} €</span>
          </div>
        </div>
      </div>

      {/* Observaciones */}
      <div className="neu-card">
        <h3 className="text-lg font-semibold mb-4">Observaciones para factura</h3>
        <textarea
          value={formData.observaciones}
          onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
          className="neu-input min-h-[150px] resize-y"
          placeholder="Observaciones adicionales para la factura..."
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-4">
        <button type="button" onClick={onCancel} className="neu-button-secondary flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
        <button type="submit" disabled={isSubmitting} className="neu-button-primary flex items-center gap-2">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar
        </button>
      </div>
    </form>
  )
}
