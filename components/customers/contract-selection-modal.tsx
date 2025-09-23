"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, ArrowLeft } from "lucide-react"
import { ContractPreview } from "./contract-preview"

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

interface ContractSelectionModalProps {
  customer: Customer
  onClose: () => void
}

export function ContractSelectionModal({ customer, onClose }: ContractSelectionModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Plantillas de ejemplo con contenido real
  const contractTemplates: ContractTemplate[] = [
    {
      id: "1",
      name: "Contrato de Servicios Tecnológicos",
      description: "Plantilla para servicios de desarrollo y consultoría tecnológica",
      category: "Tecnología",
      content: `CONTRATO DE PRESTACIÓN DE SERVICIOS TECNOLÓGICOS

Entre [empresa_nombre], con NIF [empresa_nif], domiciliada en [empresa_direccion] (en adelante, "EL PROVEEDOR"), y [cliente_nombre], con NIF/CIF [cliente_nif], domiciliada en [cliente_direccion], [cliente_ciudad], [cliente_provincia] (en adelante, "EL CLIENTE"), se acuerda el presente contrato de prestación de servicios tecnológicos.

PRIMERA.- OBJETO DEL CONTRATO
EL PROVEEDOR se compromete a prestar servicios de desarrollo de software, consultoría tecnológica y soporte técnico a EL CLIENTE, según las especificaciones que se detallarán en anexos técnicos.

SEGUNDA.- DURACIÓN
El presente contrato tendrá una duración de 12 meses, comenzando el [fecha], pudiendo ser renovado por acuerdo mutuo de las partes.

TERCERA.- PRECIO Y FORMA DE PAGO
El precio total de los servicios asciende a [precio] euros, que se abonarán según el calendario de pagos acordado.

CUARTA.- CONTACTO
Para cualquier comunicación relacionada con este contrato, EL CLIENTE designa como persona de contacto a [cliente_contacto], con teléfono [cliente_telefono] y email [cliente_email].

En [ciudad], a [fecha]

Por EL PROVEEDOR                    Por EL CLIENTE
[empresa_nombre]                    [cliente_nombre]`,
      created_at: "2024-01-15T10:00:00Z",
    },
    {
      id: "2",
      name: "Contrato de Formación Empresarial",
      description: "Plantilla para servicios de formación y capacitación",
      category: "Formación",
      content: `CONTRATO DE FORMACIÓN EMPRESARIAL

Entre [empresa_nombre], con NIF [empresa_nif], domiciliada en [empresa_direccion] (en adelante, "EL FORMADOR"), y [cliente_nombre], con NIF/CIF [cliente_nif], domiciliada en [cliente_direccion], [cliente_ciudad], [cliente_provincia] (en adelante, "EL CLIENTE"), se acuerda el presente contrato de formación empresarial.

PRIMERA.- OBJETO DEL CONTRATO
EL FORMADOR se compromete a impartir cursos de formación especializada al personal de EL CLIENTE, según el programa formativo que se detalla en el anexo I.

SEGUNDA.- MODALIDAD DE FORMACIÓN
La formación se realizará en modalidad presencial/online en las instalaciones de EL CLIENTE o en plataforma digital, según se especifique en cada curso.

TERCERA.- DURACIÓN Y HORARIOS
El programa formativo tendrá una duración total de [duración] horas, distribuidas según el calendario que se acordará con [cliente_contacto].

CUARTA.- PRECIO
El precio total de la formación asciende a [precio] euros, incluyendo material didáctico y certificados de participación.

QUINTA.- CONTACTO
Para coordinación y seguimiento, EL CLIENTE designa como responsable a [cliente_contacto], teléfono [cliente_telefono], email [cliente_email].

En [ciudad], a [fecha]

Por EL FORMADOR                     Por EL CLIENTE
[empresa_nombre]                    [cliente_nombre]`,
      created_at: "2024-01-10T09:30:00Z",
    },
    {
      id: "3",
      name: "Contrato de Consultoría Legal",
      description: "Plantilla para servicios de asesoría legal y jurídica",
      category: "Legal",
      content: `CONTRATO DE PRESTACIÓN DE SERVICIOS DE CONSULTORÍA LEGAL

Entre [empresa_nombre], con NIF [empresa_nif], domiciliada en [empresa_direccion] (en adelante, "EL CONSULTOR"), y [cliente_nombre], con NIF/CIF [cliente_nif], domiciliada en [cliente_direccion], [cliente_ciudad], [cliente_provincia] (en adelante, "EL CLIENTE"), se acuerda el presente contrato de consultoría legal.

PRIMERA.- OBJETO
EL CONSULTOR prestará servicios de asesoramiento jurídico, elaboración de contratos, revisión legal de documentos y representación en procedimientos administrativos.

SEGUNDA.- ÁMBITO DE ACTUACIÓN
Los servicios comprenden las áreas de derecho mercantil, laboral y fiscal, según las necesidades específicas de EL CLIENTE.

TERCERA.- HONORARIOS
Los honorarios se establecen en [precio] euros mensuales, facturándose por meses vencidos.

CUARTA.- CONFIDENCIALIDAD
EL CONSULTOR se compromete a mantener absoluta confidencialidad sobre toda la información a la que tenga acceso.

QUINTA.- COMUNICACIONES
Las comunicaciones se realizarán a través de [cliente_contacto], teléfono [cliente_telefono], email [cliente_email].

En [ciudad], a [fecha]

Por EL CONSULTOR                    Por EL CLIENTE
[empresa_nombre]                    [cliente_nombre]`,
      created_at: "2024-01-08T14:15:00Z",
    },
  ]

  const handleSelectTemplate = (template: ContractTemplate) => {
    setSelectedTemplate(template)
    setShowPreview(true)
  }

  const handleBackToSelection = () => {
    setShowPreview(false)
    setSelectedTemplate(null)
  }

  if (showPreview && selectedTemplate) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleBackToSelection}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <DialogTitle>Contrato Generado para {customer.name}</DialogTitle>
                <DialogDescription>Plantilla: {selectedTemplate.name}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <ContractPreview contract={selectedTemplate} customer={customer} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Seleccionar Plantilla de Contrato</DialogTitle>
          <DialogDescription>
            Selecciona una plantilla de contrato para generar el documento para <strong>{customer.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {contractTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSelectTemplate(template)}>
                      <FileText className="h-4 w-4 mr-1" />
                      Generar Contrato
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
