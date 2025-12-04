"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { SupabaseServiceService, type Service, type ServiceInput } from "@/lib/supabase-services"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

interface CreateServiceFormProps {
  service?: Service | null
  onBack: () => void
  onSuccess: () => void
}

interface Customer {
  id: string
  name: string
}

const SERVICE_CATEGORIES = [
  "Protección de Datos",
  "Consultoría",
  "Formación",
  "Auditoría",
  "Certificación",
  "Implantación",
  "Asesoramiento",
  "Gestión",
  "Traducción",
  "Otros",
]

export function CreateServiceForm({ service, onBack, onSuccess }: CreateServiceFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [formData, setFormData] = useState<ServiceInput>({
    code: service?.code || "",
    name: service?.name || "",
    description: service?.description || "",
    price: service?.price || 0,
    category: service?.category || "",
    active: service?.active ?? true,
    customer_id: service?.customer_id || "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadCustomers()
    if (!service) {
      generateCode()
    }
  }, [service])

  const loadCustomers = async () => {
    const { data } = await supabase.from("customers").select("id, name").order("name")
    setCustomers(data || [])
  }

  const generateCode = async () => {
    const code = await SupabaseServiceService.generateCode()
    setFormData((prev) => ({ ...prev, code }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre del servicio es obligatorio"
    }

    if (formData.price < 0) {
      newErrors.price = "El precio no puede ser negativo"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const input: ServiceInput = {
        ...formData,
        customer_id: formData.customer_id || undefined,
      }

      if (service) {
        await SupabaseServiceService.update(service.id, input)
      } else {
        await SupabaseServiceService.create(input)
      }

      onSuccess()
    } catch (error) {
      console.error("[v0] Error guardando servicio:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof ServiceInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="neu-button-sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h2 className="text-xl font-semibold">{service ? "Editar Servicio" : "Nuevo Servicio"}</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="neu-card">
          <CardHeader>
            <CardTitle>Información del Servicio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Código */}
              <div className="space-y-2">
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleChange("code", e.target.value)}
                  placeholder="S0001"
                  className="neu-input font-mono"
                  disabled
                />
                <p className="text-xs text-muted-foreground">Generado automáticamente</p>
              </div>

              {/* Precio */}
              <div className="space-y-2">
                <Label htmlFor="price">Precio (EUR)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleChange("price", Number.parseFloat(e.target.value) || 0)}
                  className={`neu-input ${errors.price ? "border-destructive" : ""}`}
                />
                {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
              </div>

              {/* Nombre */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Nombre del Servicio *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Ej: IMPLANTACION PROTECCION DE DATOS: GENERAL"
                  className={`neu-input ${errors.name ? "border-destructive" : ""}`}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <select
                  id="category"
                  value={formData.category || ""}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className="neu-input w-full px-3 py-2 rounded-lg"
                >
                  <option value="">Seleccionar categoría...</option>
                  {SERVICE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cliente vinculado */}
              <div className="space-y-2">
                <Label htmlFor="customer">Cliente vinculado (Facturación)</Label>
                <select
                  id="customer"
                  value={formData.customer_id || ""}
                  onChange={(e) => handleChange("customer_id", e.target.value)}
                  className="neu-input w-full px-3 py-2 rounded-lg"
                >
                  <option value="">Sin asignar</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Descripción */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Descripción detallada del servicio..."
                  rows={4}
                  className="neu-input"
                />
              </div>

              {/* Activo */}
              <div className="flex items-center gap-3">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => handleChange("active", checked)}
                />
                <Label htmlFor="active">Servicio activo</Label>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onBack} className="neu-button bg-transparent">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="neu-button-primary">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {service ? "Actualizar" : "Guardar"}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
