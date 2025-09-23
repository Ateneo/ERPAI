"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Eye, FileText, Calendar } from "lucide-react"

// Datos de ejemplo para contratos
const mockContracts = [
  {
    id: 1,
    name: "Contrato de Servicios Tecnológicos",
    description: "Plantilla para servicios de desarrollo y consultoría tecnológica",
    category: "Servicios",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
    isActive: true,
    content: `CONTRATO DE PRESTACIÓN DE SERVICIOS TECNOLÓGICOS

Entre [empresa_nombre], con NIF [empresa_nif], domiciliada en [empresa_direccion] (en adelante, "EL PRESTADOR")

Y [cliente_nombre], con NIF/CIF [cliente_nif], domiciliada en [cliente_direccion], [cliente_ciudad], [cliente_provincia] (en adelante, "EL CLIENTE")

EXPONEN:

Que EL PRESTADOR es una empresa especializada en servicios tecnológicos y desarrollo de software.

Que EL CLIENTE requiere los servicios profesionales de EL PRESTADOR.

Por todo ello, ambas partes acuerdan suscribir el presente contrato con arreglo a las siguientes:

CLÁUSULAS

PRIMERA.- OBJETO DEL CONTRATO
EL PRESTADOR se compromete a prestar servicios de desarrollo tecnológico y consultoría a EL CLIENTE, representado por [cliente_contacto].

SEGUNDA.- DURACIÓN
El presente contrato tendrá una duración de 12 meses, prorrogables por acuerdo de ambas partes.

TERCERA.- PRECIO Y FORMA DE PAGO
El precio de los servicios será de [precio] euros, pagaderos según las condiciones acordadas.

CUARTA.- CONTACTO
Para cualquier comunicación, EL CLIENTE podrá contactar a través del email [cliente_email] o teléfono [cliente_telefono].

En [ciudad], a [fecha]

EL PRESTADOR                    EL CLIENTE
[empresa_nombre]                [cliente_nombre]`,
  },
  {
    id: 2,
    name: "Contrato de Formación Empresarial",
    description: "Plantilla para servicios de formación y capacitación",
    category: "Formación",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-18",
    isActive: true,
    content: `CONTRATO DE SERVICIOS DE FORMACIÓN

Entre [empresa_nombre], con domicilio en [empresa_direccion] (EL FORMADOR)

Y [cliente_nombre], con NIF/CIF [cliente_nif], con domicilio en [cliente_direccion], [cliente_ciudad] (EL CLIENTE)

ACUERDAN:

PRIMERA.- SERVICIOS DE FORMACIÓN
EL FORMADOR impartirá cursos de formación especializada al personal de EL CLIENTE.

SEGUNDA.- COORDINACIÓN
La persona de contacto por parte de EL CLIENTE será [cliente_contacto], localizable en [cliente_email].

TERCERA.- MODALIDAD
Los servicios se prestarán en las instalaciones de EL CLIENTE ubicadas en [cliente_provincia].

En [ciudad], a [fecha]

Firmado: [empresa_nombre] - [cliente_nombre]`,
  },
  {
    id: 3,
    name: "Contrato de Consultoría Legal",
    description: "Plantilla para servicios de asesoría jurídica",
    category: "Legal",
    createdAt: "2024-01-05",
    updatedAt: "2024-01-12",
    isActive: true,
    content: `CONTRATO DE PRESTACIÓN DE SERVICIOS JURÍDICOS

PARTES:
- PRESTADOR: [empresa_nombre] (NIF: [empresa_nif])
- CLIENTE: [cliente_nombre] (NIF/CIF: [cliente_nif])

DOMICILIOS:
- PRESTADOR: [empresa_direccion]
- CLIENTE: [cliente_direccion], [cliente_ciudad], [cliente_provincia]

SERVICIOS:
Asesoramiento jurídico integral para [cliente_nombre].

CONTACTO:
Persona responsable: [cliente_contacto]
Email: [cliente_email]
Teléfono: [cliente_telefono]

Fecha: [fecha]
Lugar: [ciudad]`,
  },
]

export function ContractsList({ onCreateContract, onEditContract, onPreviewContract }) {
  const [contracts, setContracts] = useState(mockContracts)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredContracts = contracts.filter(
    (contract) =>
      contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getCategoryColor = (category) => {
    const colors = {
      Servicios: "bg-blue-100 text-blue-800",
      Formación: "bg-green-100 text-green-800",
      Legal: "bg-purple-100 text-purple-800",
      Consultoría: "bg-orange-100 text-orange-800",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Plantillas de Contratos</CardTitle>
            <Button onClick={onCreateContract}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Plantilla
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar plantillas por nombre, descripción o categoría..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredContracts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay plantillas</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "No se encontraron plantillas con ese criterio."
                  : "Crea tu primera plantilla de contrato."}
              </p>
              <Button onClick={onCreateContract}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Plantilla
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Última Modificación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.name}</TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(contract.category)}>{contract.category}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{contract.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(contract.updatedAt).toLocaleDateString("es-ES")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={contract.isActive ? "default" : "secondary"}>
                          {contract.isActive ? "Activa" : "Inactiva"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => onPreviewContract(contract)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => onEditContract(contract)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="mt-4 text-sm text-muted-foreground">
            Mostrando {filteredContracts.length} de {contracts.length} plantillas
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campos Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium mb-2">Datos del Cliente</h4>
              <div className="space-y-1 text-sm">
                <code className="bg-muted px-2 py-1 rounded">[cliente_nombre]</code>
                <code className="bg-muted px-2 py-1 rounded">[cliente_nif]</code>
                <code className="bg-muted px-2 py-1 rounded">[cliente_email]</code>
                <code className="bg-muted px-2 py-1 rounded">[cliente_telefono]</code>
                <code className="bg-muted px-2 py-1 rounded">[cliente_contacto]</code>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Dirección del Cliente</h4>
              <div className="space-y-1 text-sm">
                <code className="bg-muted px-2 py-1 rounded">[cliente_direccion]</code>
                <code className="bg-muted px-2 py-1 rounded">[cliente_ciudad]</code>
                <code className="bg-muted px-2 py-1 rounded">[cliente_provincia]</code>
                <code className="bg-muted px-2 py-1 rounded">[cliente_codigo_postal]</code>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Datos de la Empresa</h4>
              <div className="space-y-1 text-sm">
                <code className="bg-muted px-2 py-1 rounded">[empresa_nombre]</code>
                <code className="bg-muted px-2 py-1 rounded">[empresa_nif]</code>
                <code className="bg-muted px-2 py-1 rounded">[empresa_direccion]</code>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Otros Campos</h4>
              <div className="space-y-1 text-sm">
                <code className="bg-muted px-2 py-1 rounded">[fecha]</code>
                <code className="bg-muted px-2 py-1 rounded">[ciudad]</code>
                <code className="bg-muted px-2 py-1 rounded">[precio]</code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
