"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Download, Printer, Copy, Mail, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  tax_id: string
  address: string
  city: string
  postal_code: string
  province: string
  country: string
  sector: string
  contact_person: string
  website?: string
  notes?: string
  is_active: boolean
  created_at: string
}

interface ContractTemplate {
  id: string
  name: string
  description: string
  category: string
  content: string
  created_at: string
}

interface ContractPreviewProps {
  contract: ContractTemplate
  customer: Customer
}

export function ContractPreview({ contract, customer }: ContractPreviewProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  // Datos de la empresa (estos podrían venir de una configuración)
  const companyData = {
    name: "Flowers&Saints SL",
    nif: "B12345678",
    address: "Calle Ejemplo 123, 28001 Madrid",
    city: "Madrid",
  }

  // Función para reemplazar los campos en el contenido del contrato
  const replaceFields = (content: string) => {
    const currentDate = new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    return content
      .replace(/\[cliente_nombre\]/g, customer.name)
      .replace(/\[cliente_nif\]/g, customer.tax_id)
      .replace(/\[cliente_email\]/g, customer.email)
      .replace(/\[cliente_telefono\]/g, customer.phone)
      .replace(/\[cliente_contacto\]/g, customer.contact_person)
      .replace(/\[cliente_direccion\]/g, customer.address)
      .replace(/\[cliente_ciudad\]/g, customer.city)
      .replace(/\[cliente_provincia\]/g, customer.province)
      .replace(/\[empresa_nombre\]/g, companyData.name)
      .replace(/\[empresa_nif\]/g, companyData.nif)
      .replace(/\[empresa_direccion\]/g, companyData.address)
      .replace(/\[fecha\]/g, currentDate)
      .replace(/\[ciudad\]/g, companyData.city)
      .replace(/\[precio\]/g, "[PRECIO A DEFINIR]")
      .replace(/\[duración\]/g, "[DURACIÓN A DEFINIR]")
  }

  const processedContent = replaceFields(contract.content)

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    const element = document.createElement("a")
    const file = new Blob([processedContent], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `Contrato_${customer.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    toast({
      title: "Contrato descargado",
      description: "El archivo se ha descargado correctamente",
    })
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(processedContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)

      toast({
        title: "Contrato copiado",
        description: "El contenido se ha copiado al portapapeles",
      })
    } catch (err) {
      toast({
        title: "Error al copiar",
        description: "No se pudo copiar el contenido",
        variant: "destructive",
      })
    }
  }

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`Contrato - ${contract.name}`)
    const body = encodeURIComponent(`Estimado/a ${customer.contact_person},

Adjunto encontrará el contrato para su revisión:

${processedContent}

Saludos cordiales,
${companyData.name}`)

    window.open(`mailto:${customer.email}?subject=${subject}&body=${body}`)
  }

  return (
    <div className="space-y-6">
      {/* Barra de herramientas */}
      <div className="flex flex-wrap gap-2 p-4 bg-muted/50 rounded-lg">
        <Button onClick={handlePrint} variant="outline" size="sm">
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
        <Button onClick={handleDownload} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Descargar
        </Button>
        <Button onClick={handleCopy} variant="outline" size="sm">
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copiar
            </>
          )}
        </Button>
        <Button onClick={handleSendEmail} variant="outline" size="sm">
          <Mail className="h-4 w-4 mr-2" />
          Enviar por Email
        </Button>
      </div>

      {/* Información del contrato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{contract.name}</span>
            <span className="text-sm font-normal text-muted-foreground">Cliente: {customer.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Plantilla:</strong> {contract.name}
            </div>
            <div>
              <strong>Categoría:</strong> {contract.category}
            </div>
            <div>
              <strong>Cliente:</strong> {customer.name}
            </div>
            <div>
              <strong>NIF/CIF:</strong> {customer.tax_id}
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Contenido del contrato */}
      <Card>
        <CardContent className="p-8">
          <div
            className="prose prose-sm max-w-none whitespace-pre-line font-mono text-sm leading-relaxed"
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
              lineHeight: "1.6",
            }}
          >
            {processedContent}
          </div>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Nombre:</strong> {customer.name}
            </div>
            <div>
              <strong>NIF/CIF:</strong> {customer.tax_id}
            </div>
            <div>
              <strong>Email:</strong> {customer.email}
            </div>
            <div>
              <strong>Teléfono:</strong> {customer.phone}
            </div>
            <div>
              <strong>Contacto:</strong> {customer.contact_person}
            </div>
            <div>
              <strong>Sector:</strong> {customer.sector}
            </div>
            <div className="md:col-span-2">
              <strong>Dirección:</strong> {customer.address}, {customer.city}, {customer.province}
            </div>
            {customer.website && (
              <div className="md:col-span-2">
                <strong>Web:</strong> {customer.website}
              </div>
            )}
            {customer.notes && (
              <div className="md:col-span-2">
                <strong>Notas:</strong> {customer.notes}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
