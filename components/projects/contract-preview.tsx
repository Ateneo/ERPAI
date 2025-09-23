"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, PrinterIcon as Print, Send } from "lucide-react"

// Datos de ejemplo de la empresa (esto vendría de la configuración)
const companyData = {
  nombre: "Flowers&Saints SL",
  nif: "B12345678",
  direccion: "Calle Ejemplo 123, 28001 Madrid",
}

export function ContractPreview({ contract, customer, onBack }) {
  const [processedContent, setProcessedContent] = useState("")

  // Función para reemplazar los campos del contrato con datos reales
  const processContractContent = (content, customerData, companyData) => {
    if (!content) return ""

    let processed = content

    // Reemplazar campos del cliente
    if (customerData) {
      processed = processed
        .replace(/\[cliente_nombre\]/g, customerData.name || "[cliente_nombre]")
        .replace(/\[cliente_nif\]/g, customerData.nif || "[cliente_nif]")
        .replace(/\[cliente_email\]/g, customerData.email || "[cliente_email]")
        .replace(/\[cliente_telefono\]/g, customerData.phone || "[cliente_telefono]")
        .replace(/\[cliente_contacto\]/g, customerData.contact || "[cliente_contacto]")
        .replace(/\[cliente_direccion\]/g, customerData.address || "[cliente_direccion]")
        .replace(/\[cliente_ciudad\]/g, customerData.city || "[cliente_ciudad]")
        .replace(/\[cliente_provincia\]/g, customerData.province || "[cliente_provincia]")
        .replace(/\[cliente_codigo_postal\]/g, customerData.postalCode || "[cliente_codigo_postal]")
    }

    // Reemplazar campos de la empresa
    processed = processed
      .replace(/\[empresa_nombre\]/g, companyData.nombre)
      .replace(/\[empresa_nif\]/g, companyData.nif)
      .replace(/\[empresa_direccion\]/g, companyData.direccion)

    // Reemplazar otros campos
    processed = processed
      .replace(/\[fecha\]/g, new Date().toLocaleDateString("es-ES"))
      .replace(/\[ciudad\]/g, "Madrid")
      .replace(/\[precio\]/g, "[PRECIO A DEFINIR]")

    return processed
  }

  // Procesar el contenido cuando se carga el componente
  useState(() => {
    if (contract?.content) {
      const processed = processContractContent(contract.content, customer, companyData)
      setProcessedContent(processed)
    }
  }, [contract, customer])

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    const element = document.createElement("a")
    const file = new Blob([processedContent], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `${contract?.name || "contrato"}_${customer?.name || "cliente"}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleSend = () => {
    // Aquí implementarías el envío por email
    alert("Funcionalidad de envío por email pendiente de implementar")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{contract?.name}</h2>
            {customer && <p className="text-muted-foreground">Para: {customer.name}</p>}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePrint}>
            <Print className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Descargar
          </Button>
          {customer && (
            <Button onClick={handleSend}>
              <Send className="h-4 w-4 mr-2" />
              Enviar por Email
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vista Previa del Contrato</CardTitle>
          {customer && (
            <div className="text-sm text-muted-foreground">
              Los campos han sido reemplazados con los datos de <strong>{customer.name}</strong>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="bg-white p-8 border rounded-lg shadow-sm print:shadow-none print:border-none">
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-900">
                {processedContent || contract?.content || "No hay contenido disponible"}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {!customer && (
        <Card>
          <CardHeader>
            <CardTitle>Información</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Esta es una vista previa de la plantilla. Los campos entre corchetes se reemplazarán automáticamente con
              los datos del cliente cuando generes un contrato específico desde el listado de clientes.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
