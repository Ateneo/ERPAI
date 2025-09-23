"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Bold, Italic, Underline, Eye, Type, AlignLeft, AlignCenter, AlignRight } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export function ContractEditor({ contract, onBack, onContractSaved, isNew = false }) {
  const [content, setContent] = useState(contract?.content || "")
  const [showPreview, setShowPreview] = useState(false)
  const textareaRef = useRef(null)

  const handleSave = () => {
    if (isNew) {
      onContractSaved(content)
    } else {
      // Aquí actualizarías en la base de datos
      console.log("Actualizando contrato:", { ...contract, content })
      onContractSaved()
    }
  }

  const insertField = (field) => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newContent = content.substring(0, start) + field + content.substring(end)
      setContent(newContent)

      // Restaurar el foco y posición del cursor
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + field.length, start + field.length)
      }, 0)
    }
  }

  const formatText = (format) => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = content.substring(start, end)

      if (selectedText) {
        let formattedText = ""
        switch (format) {
          case "bold":
            formattedText = `**${selectedText}**`
            break
          case "italic":
            formattedText = `*${selectedText}*`
            break
          case "underline":
            formattedText = `__${selectedText}__`
            break
          default:
            formattedText = selectedText
        }

        const newContent = content.substring(0, start) + formattedText + content.substring(end)
        setContent(newContent)
      }
    }
  }

  const clientFields = [
    { field: "[cliente_nombre]", label: "Nombre Cliente" },
    { field: "[cliente_nif]", label: "NIF/CIF Cliente" },
    { field: "[cliente_email]", label: "Email Cliente" },
    { field: "[cliente_telefono]", label: "Teléfono Cliente" },
    { field: "[cliente_contacto]", label: "Contacto Cliente" },
    { field: "[cliente_direccion]", label: "Dirección Cliente" },
    { field: "[cliente_ciudad]", label: "Ciudad Cliente" },
    { field: "[cliente_provincia]", label: "Provincia Cliente" },
  ]

  const companyFields = [
    { field: "[empresa_nombre]", label: "Nombre Empresa" },
    { field: "[empresa_nif]", label: "NIF Empresa" },
    { field: "[empresa_direccion]", label: "Dirección Empresa" },
  ]

  const otherFields = [
    { field: "[fecha]", label: "Fecha" },
    { field: "[ciudad]", label: "Ciudad" },
    { field: "[precio]", label: "Precio" },
  ]

  if (showPreview) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setShowPreview(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Editor
          </Button>
          <h2 className="text-2xl font-bold">Vista Previa del Contrato</h2>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{content}</pre>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h2 className="text-2xl font-bold">{isNew ? "Editor de Nueva Plantilla" : `Editando: ${contract?.name}`}</h2>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Vista Previa
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Editor de Contrato</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => formatText("bold")}>
                  <Bold className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => formatText("italic")}>
                  <Italic className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => formatText("underline")}>
                  <Underline className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button variant="outline" size="sm">
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe aquí el contenido de tu contrato. Usa los campos de la derecha para insertar datos dinámicos..."
                className="min-h-[600px] font-mono text-sm"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Campos del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {clientFields.map(({ field, label }) => (
                <Button
                  key={field}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => insertField(field)}
                >
                  <Type className="h-3 w-3 mr-2" />
                  {label}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Campos de la Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {companyFields.map(({ field, label }) => (
                <Button
                  key={field}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => insertField(field)}
                >
                  <Type className="h-3 w-3 mr-2" />
                  {label}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Otros Campos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {otherFields.map(({ field, label }) => (
                <Button
                  key={field}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => insertField(field)}
                >
                  <Type className="h-3 w-3 mr-2" />
                  {label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
