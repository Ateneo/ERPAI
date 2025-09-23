"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Eye } from "lucide-react"
import { ContractEditor } from "./contract-editor"

const categories = ["Servicios", "Formación", "Legal", "Consultoría", "Mantenimiento", "Desarrollo", "Otros"]

export function CreateContractForm({ onBack, onContractSaved }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    content: "",
  })
  const [showEditor, setShowEditor] = useState(false)
  const [errors, setErrors] = useState({})

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio"
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es obligatoria"
    }

    if (!formData.category) {
      newErrors.category = "La categoría es obligatoria"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) {
      return
    }

    // Aquí guardarías en la base de datos
    console.log("Guardando plantilla:", formData)
    onContractSaved()
  }

  const handleOpenEditor = () => {
    if (!validateForm()) {
      return
    }
    setShowEditor(true)
  }

  const handleEditorSave = (content) => {
    setFormData((prev) => ({
      ...prev,
      content,
    }))
    setShowEditor(false)
  }

  if (showEditor) {
    return (
      <ContractEditor
        contract={{ ...formData, id: "new" }}
        onBack={() => setShowEditor(false)}
        onContractSaved={handleEditorSave}
        isNew={true}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Listado
          </Button>
          <h2 className="text-2xl font-bold">Nueva Plantilla de Contrato</h2>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Plantilla *</Label>
              <Input
                id="name"
                placeholder="Ej: Contrato de Servicios Tecnológicos"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              placeholder="Describe brevemente el propósito de esta plantilla..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={errors.description ? "border-red-500" : ""}
              rows={3}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={handleOpenEditor}>
              <Eye className="h-4 w-4 mr-2" />
              Abrir Editor
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Plantilla
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campos Disponibles para Usar en el Contrato</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-blue-600">Datos del Cliente</h4>
              <div className="space-y-2">
                {[
                  { field: "[cliente_nombre]", desc: "Nombre/Razón social" },
                  { field: "[cliente_nif]", desc: "NIF/CIF del cliente" },
                  { field: "[cliente_email]", desc: "Email de contacto" },
                  { field: "[cliente_telefono]", desc: "Teléfono" },
                  { field: "[cliente_contacto]", desc: "Persona de contacto" },
                ].map(({ field, desc }) => (
                  <div key={field} className="flex flex-col">
                    <code className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm font-mono">{field}</code>
                    <span className="text-xs text-muted-foreground mt-1">{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3 text-green-600">Dirección del Cliente</h4>
              <div className="space-y-2">
                {[
                  { field: "[cliente_direccion]", desc: "Dirección completa" },
                  { field: "[cliente_ciudad]", desc: "Ciudad" },
                  { field: "[cliente_provincia]", desc: "Provincia" },
                  { field: "[cliente_codigo_postal]", desc: "Código postal" },
                ].map(({ field, desc }) => (
                  <div key={field} className="flex flex-col">
                    <code className="bg-green-50 text-green-700 px-2 py-1 rounded text-sm font-mono">{field}</code>
                    <span className="text-xs text-muted-foreground mt-1">{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3 text-purple-600">Datos de la Empresa</h4>
              <div className="space-y-2">
                {[
                  { field: "[empresa_nombre]", desc: "Nombre de tu empresa" },
                  { field: "[empresa_nif]", desc: "NIF/CIF de tu empresa" },
                  { field: "[empresa_direccion]", desc: "Dirección de tu empresa" },
                ].map(({ field, desc }) => (
                  <div key={field} className="flex flex-col">
                    <code className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-sm font-mono">{field}</code>
                    <span className="text-xs text-muted-foreground mt-1">{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3 text-orange-600">Campos Generales</h4>
              <div className="space-y-2">
                {[
                  { field: "[fecha]", desc: "Fecha actual" },
                  { field: "[ciudad]", desc: "Ciudad de firma" },
                  { field: "[precio]", desc: "Precio del servicio" },
                ].map(({ field, desc }) => (
                  <div key={field} className="flex flex-col">
                    <code className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-sm font-mono">{field}</code>
                    <span className="text-xs text-muted-foreground mt-1">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
