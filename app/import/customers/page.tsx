"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Upload,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Users,
  FileSpreadsheet,
  Eye,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { validateSpanishTaxId, SPANISH_PROVINCES, BUSINESS_SECTORS } from "@/lib/verifactu-api"

interface Customer {
  name: string
  email: string
  phone?: string
  tax_id: string
  address?: string
  city?: string
  postal_code?: string
  province?: string
  country?: string
  sector: string
  contact_person?: string
  website?: string
  notes?: string
  commercial_name?: string
  administrator?: string
  administrator_nif?: string
  commercial_agent?: string
  available_credit?: number
  validated_credit?: number
  social_security_accounts?: string
  is_sme?: boolean
  is_new_creation?: boolean
  creation_date?: string
  previous_year_transactions?: boolean
  phone_2?: string
  documentation_email?: string
  issuers?: string
  has_rlt?: boolean
  rlt_name?: string
  rlt_nif?: string
  number_of_centers?: number
  centers_location?: string
  activity_description?: string
  advisory_firm?: string
  advisory_contact?: string
  consultant?: string
  collaborator?: string
  telemarketing?: string
  telemarketing_observations?: string
  central_observations?: string
  other_observations?: string
}

interface ValidationError {
  row: number
  field: string
  message: string
  value?: string
}

interface ImportResult {
  success: number
  errors: ValidationError[]
  duplicates: number
  warnings: string[]
}

const REQUIRED_FIELDS = ["name", "email", "tax_id", "sector"]

const FIELD_MAPPINGS = {
  // Campos básicos
  nombre: "name",
  name: "name",
  "razón social": "name",
  razon_social: "name",
  empresa: "name",

  email: "email",
  correo: "email",
  "correo electrónico": "email",
  correo_electronico: "email",
  "e-mail": "email",

  teléfono: "phone",
  telefono: "phone",
  phone: "phone",
  tel: "phone",
  móvil: "phone",
  movil: "phone",

  nif: "tax_id",
  cif: "tax_id",
  nie: "tax_id",
  tax_id: "tax_id",
  "identificación fiscal": "tax_id",
  identificacion_fiscal: "tax_id",

  dirección: "address",
  direccion: "address",
  address: "address",
  domicilio: "address",

  ciudad: "city",
  city: "city",
  municipio: "city",
  localidad: "city",

  "código postal": "postal_code",
  codigo_postal: "postal_code",
  postal_code: "postal_code",
  cp: "postal_code",

  provincia: "province",
  province: "province",

  país: "country",
  pais: "country",
  country: "country",

  sector: "sector",
  actividad: "sector",
  industry: "sector",

  "persona de contacto": "contact_person",
  contacto: "contact_person",
  contact_person: "contact_person",
  responsable: "contact_person",

  web: "website",
  website: "website",
  "sitio web": "website",
  "página web": "website",
  url: "website",

  notas: "notes",
  notes: "notes",
  observaciones: "notes",
  comentarios: "notes",
}

export default function ImportCustomersPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({})
  const [previewData, setPreviewData] = useState<Customer[]>([])
  const [importProgress, setImportProgress] = useState(0)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Generar plantilla CSV
  const generateTemplate = () => {
    const templateHeaders = [
      "name",
      "email",
      "phone",
      "tax_id",
      "address",
      "city",
      "postal_code",
      "province",
      "country",
      "sector",
      "contact_person",
      "website",
      "notes",
      "commercial_name",
      "administrator",
      "administrator_nif",
      "commercial_agent",
      "available_credit",
      "validated_credit",
      "social_security_accounts",
      "is_sme",
      "is_new_creation",
      "creation_date",
      "previous_year_transactions",
      "phone_2",
      "documentation_email",
      "issuers",
      "has_rlt",
      "rlt_name",
      "rlt_nif",
      "number_of_centers",
      "centers_location",
      "activity_description",
      "advisory_firm",
      "advisory_contact",
      "consultant",
      "collaborator",
      "telemarketing",
      "telemarketing_observations",
      "central_observations",
      "other_observations",
    ]

    const sampleData = [
      "Empresa Ejemplo S.L.",
      "contacto@ejemplo.com",
      "+34 91 123 45 67",
      "B12345678",
      "Calle Principal 123",
      "Madrid",
      "28001",
      "Madrid",
      "España",
      "Tecnología",
      "Juan García",
      "https://www.ejemplo.com",
      "Cliente de ejemplo",
      "Ejemplo Comercial",
      "Juan García López",
      "12345678A",
      "María López",
      "50000.00",
      "30000.00",
      "Cuenta SS: 123456789",
      "true",
      "false",
      "2020-01-15",
      "true",
      "+34 600 123 456",
      "documentos@ejemplo.com",
      "Emisor Principal",
      "false",
      "",
      "",
      "3",
      "Madrid, Barcelona, Valencia",
      "Desarrollo de software empresarial",
      "Asesoría Fiscal ABC",
      "Ana Martín",
      "Carlos Ruiz",
      "Pedro Sánchez",
      "Telemarketing Pro",
      "Cliente muy activo",
      "Observaciones centrales",
      "Otras observaciones importantes",
    ]

    const csvContent = [templateHeaders.join(","), sampleData.map((field) => `"${field}"`).join(",")].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "plantilla_clientes.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Parsear archivo
  const parseFile = useCallback(async (file: File) => {
    return new Promise<{ data: any[]; headers: string[] }>((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const lines = text.split("\n").filter((line) => line.trim())

          if (lines.length === 0) {
            reject(new Error("El archivo está vacío"))
            return
          }

          // Detectar separador
          const firstLine = lines[0]
          let separator = ","
          if (firstLine.includes("\t")) separator = "\t"
          else if (firstLine.includes(";")) separator = ";"

          // Parsear headers
          const headers = firstLine.split(separator).map((h) => h.trim().replace(/"/g, ""))

          // Parsear datos
          const data = lines.slice(1).map((line, index) => {
            const values = line.split(separator).map((v) => v.trim().replace(/"/g, ""))
            const row: any = { _rowIndex: index + 2 } // +2 porque empezamos desde la línea 2

            headers.forEach((header, i) => {
              row[header] = values[i] || ""
            })

            return row
          })

          resolve({ data, headers })
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error("Error leyendo el archivo"))
      reader.readAsText(file, "UTF-8")
    })
  }, [])

  // Manejar subida de archivo
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    const allowedTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/tab-separated-values",
    ]

    if (!allowedTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(csv|xlsx|xls|tsv)$/i)) {
      alert("Formato de archivo no soportado. Use CSV, Excel o TSV.")
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      // 10MB
      alert("El archivo es demasiado grande. Máximo 10MB.")
      return
    }

    setFile(selectedFile)
    setIsProcessing(true)

    try {
      const { data, headers } = await parseFile(selectedFile)

      if (data.length > 1000) {
        alert("Máximo 1000 registros por archivo.")
        return
      }

      setParsedData(data)
      setHeaders(headers)

      // Auto-mapear campos comunes
      const autoMapping: Record<string, string> = {}
      headers.forEach((header) => {
        const normalizedHeader = header.toLowerCase().trim()
        const mappedField = FIELD_MAPPINGS[normalizedHeader]
        if (mappedField) {
          autoMapping[header] = mappedField
        }
      })

      setFieldMapping(autoMapping)
      setCurrentStep(2)
    } catch (error) {
      console.error("Error parsing file:", error)
      alert(`Error procesando archivo: ${error instanceof Error ? error.message : "Error desconocido"}`)
    } finally {
      setIsProcessing(false)
    }
  }

  // Generar vista previa
  const generatePreview = () => {
    const preview: Customer[] = parsedData.slice(0, 10).map((row) => {
      const customer: any = {}

      Object.entries(fieldMapping).forEach(([csvField, dbField]) => {
        if (dbField && row[csvField] !== undefined) {
          let value = row[csvField]?.toString().trim()

          // Conversiones de tipo
          if (["available_credit", "validated_credit", "number_of_centers"].includes(dbField)) {
            value = value ? Number.parseFloat(value) : undefined
          } else if (["is_sme", "is_new_creation", "previous_year_transactions", "has_rlt"].includes(dbField)) {
            value = value ? ["true", "1", "sí", "si", "yes"].includes(value.toLowerCase()) : false
          } else if (dbField === "creation_date" && value) {
            // Intentar parsear fecha
            const date = new Date(value)
            value = isNaN(date.getTime()) ? undefined : date.toISOString().split("T")[0]
          }

          customer[dbField] = value
        }
      })

      // Valores por defecto
      customer.country = customer.country || "España"
      customer.is_active = true
      customer.verifactu_status = "pending"

      return customer
    })

    setPreviewData(preview)
    setCurrentStep(3)
  }

  // Validar datos
  const validateData = (customers: Customer[]): ValidationError[] => {
    const errors: ValidationError[] = []
    const seenEmails = new Set<string>()
    const seenTaxIds = new Set<string>()

    customers.forEach((customer, index) => {
      const rowNumber = index + 1

      // Validar campos obligatorios
      REQUIRED_FIELDS.forEach((field) => {
        if (!customer[field as keyof Customer] || customer[field as keyof Customer]?.toString().trim() === "") {
          errors.push({
            row: rowNumber,
            field,
            message: `Campo obligatorio vacío: ${field}`,
            value: customer[field as keyof Customer]?.toString(),
          })
        }
      })

      // Validar email
      if (customer.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(customer.email)) {
          errors.push({
            row: rowNumber,
            field: "email",
            message: "Formato de email inválido",
            value: customer.email,
          })
        }

        // Verificar duplicados de email
        if (seenEmails.has(customer.email.toLowerCase())) {
          errors.push({
            row: rowNumber,
            field: "email",
            message: "Email duplicado en el archivo",
            value: customer.email,
          })
        }
        seenEmails.add(customer.email.toLowerCase())
      }

      // Validar NIF/CIF
      if (customer.tax_id) {
        if (!validateSpanishTaxId(customer.tax_id)) {
          errors.push({
            row: rowNumber,
            field: "tax_id",
            message: "Formato de NIF/CIF/NIE inválido",
            value: customer.tax_id,
          })
        }

        // Verificar duplicados de tax_id
        if (seenTaxIds.has(customer.tax_id.toUpperCase())) {
          errors.push({
            row: rowNumber,
            field: "tax_id",
            message: "NIF/CIF duplicado en el archivo",
            value: customer.tax_id,
          })
        }
        seenTaxIds.add(customer.tax_id.toUpperCase())
      }

      // Validar teléfono
      if (customer.phone) {
        const phoneRegex = /^[+]?[0-9\s\-$$$$]{9,15}$/
        if (!phoneRegex.test(customer.phone)) {
          errors.push({
            row: rowNumber,
            field: "phone",
            message: "Formato de teléfono inválido",
            value: customer.phone,
          })
        }
      }

      // Validar código postal
      if (customer.postal_code) {
        const postalRegex = /^[0-9]{5}$/
        if (!postalRegex.test(customer.postal_code)) {
          errors.push({
            row: rowNumber,
            field: "postal_code",
            message: "Código postal debe tener 5 dígitos",
            value: customer.postal_code,
          })
        }
      }

      // Validar provincia
      if (customer.province && !SPANISH_PROVINCES.includes(customer.province)) {
        errors.push({
          row: rowNumber,
          field: "province",
          message: "Provincia no válida",
          value: customer.province,
        })
      }

      // Validar sector
      if (customer.sector && !BUSINESS_SECTORS.includes(customer.sector)) {
        errors.push({
          row: rowNumber,
          field: "sector",
          message: "Sector no válido",
          value: customer.sector,
        })
      }

      // Validar website
      if (customer.website) {
        try {
          new URL(customer.website)
        } catch {
          errors.push({
            row: rowNumber,
            field: "website",
            message: "URL de website inválida",
            value: customer.website,
          })
        }
      }
    })

    return errors
  }

  // Procesar importación
  const processImport = async () => {
    setIsProcessing(true)
    setImportProgress(0)
    setCurrentStep(4)

    try {
      // Generar todos los datos
      const allCustomers: Customer[] = parsedData.map((row) => {
        const customer: any = {}

        Object.entries(fieldMapping).forEach(([csvField, dbField]) => {
          if (dbField && row[csvField] !== undefined) {
            let value = row[csvField]?.toString().trim()

            // Conversiones de tipo
            if (["available_credit", "validated_credit", "number_of_centers"].includes(dbField)) {
              value = value ? Number.parseFloat(value) : undefined
            } else if (["is_sme", "is_new_creation", "previous_year_transactions", "has_rlt"].includes(dbField)) {
              value = value ? ["true", "1", "sí", "si", "yes"].includes(value.toLowerCase()) : false
            } else if (dbField === "creation_date" && value) {
              const date = new Date(value)
              value = isNaN(date.getTime()) ? undefined : date.toISOString().split("T")[0]
            }

            customer[dbField] = value
          }
        })

        // Valores por defecto
        customer.country = customer.country || "España"
        customer.is_active = true
        customer.verifactu_status = "pending"
        customer.import_source = "csv_import"
        customer.imported_at = new Date().toISOString()

        return customer
      })

      // Validar datos
      const validationErrors = validateData(allCustomers)

      if (validationErrors.length > 0) {
        setImportResult({
          success: 0,
          errors: validationErrors,
          duplicates: 0,
          warnings: [],
        })
        setCurrentStep(5)
        return
      }

      // Simular progreso de importación
      let successCount = 0
      const errors: ValidationError[] = []
      const warnings: string[] = []

      for (let i = 0; i < allCustomers.length; i++) {
        const customer = allCustomers[i]

        // Simular delay
        await new Promise((resolve) => setTimeout(resolve, 100))

        try {
          // Aquí iría la llamada real a la API
          // const response = await fetch('/api/customers', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify(customer)
          // })

          // Simular éxito en el 95% de los casos
          if (Math.random() > 0.05) {
            successCount++
          } else {
            errors.push({
              row: i + 1,
              field: "general",
              message: "Error simulado de importación",
              value: customer.name,
            })
          }
        } catch (error) {
          errors.push({
            row: i + 1,
            field: "general",
            message: `Error importando: ${error instanceof Error ? error.message : "Error desconocido"}`,
            value: customer.name,
          })
        }

        setImportProgress(((i + 1) / allCustomers.length) * 100)
      }

      setImportResult({
        success: successCount,
        errors,
        duplicates: 0,
        warnings,
      })

      setCurrentStep(5)
    } catch (error) {
      console.error("Error during import:", error)
      setImportResult({
        success: 0,
        errors: [
          {
            row: 0,
            field: "general",
            message: `Error general: ${error instanceof Error ? error.message : "Error desconocido"}`,
          },
        ],
        duplicates: 0,
        warnings: [],
      })
      setCurrentStep(5)
    } finally {
      setIsProcessing(false)
    }
  }

  // Reiniciar proceso
  const resetProcess = () => {
    setCurrentStep(1)
    setFile(null)
    setParsedData([])
    setHeaders([])
    setFieldMapping({})
    setPreviewData([])
    setImportProgress(0)
    setImportResult(null)
    setIsProcessing(false)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/settings">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8" />
              Importar Clientes
            </h1>
            <p className="text-muted-foreground">Importa clientes desde archivos CSV, Excel o TSV</p>
          </div>
        </div>
        <Button onClick={generateTemplate} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Descargar Plantilla
        </Button>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}
                `}
                >
                  {step}
                </div>
                {step < 5 && (
                  <div
                    className={`
                    w-16 h-1 mx-2
                    ${currentStep > step ? "bg-primary" : "bg-muted"}
                  `}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subir Archivo</span>
            <span>Mapear Campos</span>
            <span>Vista Previa</span>
            <span>Importar</span>
            <span>Resultados</span>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Upload File */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Paso 1: Subir Archivo
            </CardTitle>
            <CardDescription>Selecciona un archivo CSV, Excel o TSV con los datos de clientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <div className="space-y-2">
                <Label htmlFor="file-upload" className="text-lg font-medium cursor-pointer">
                  Arrastra tu archivo aquí o haz clic para seleccionar
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv,.xlsx,.xls,.tsv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <p className="text-sm text-muted-foreground">Formatos soportados: CSV, Excel (.xlsx, .xls), TSV</p>
                <p className="text-sm text-muted-foreground">Tamaño máximo: 10MB | Máximo 1000 registros</p>
              </div>
            </div>

            {isProcessing && (
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Procesando archivo...</span>
              </div>
            )}

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Importante:</strong> Asegúrate de que tu archivo incluya los campos obligatorios: nombre, email,
                NIF/CIF y sector. Descarga la plantilla para ver el formato correcto.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Map Fields */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Paso 2: Mapear Campos
            </CardTitle>
            <CardDescription>Asocia las columnas de tu archivo con los campos de la base de datos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {headers.map((header) => (
                <div key={header} className="space-y-2">
                  <Label className="text-sm font-medium">
                    {header}
                    {fieldMapping[header] && REQUIRED_FIELDS.includes(fieldMapping[header]) && (
                      <Badge variant="destructive" className="ml-2 text-xs">
                        Obligatorio
                      </Badge>
                    )}
                  </Label>
                  <Select
                    value={fieldMapping[header] || "none"}
                    onValueChange={(value) => setFieldMapping((prev) => ({ ...prev, [header]: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar campo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No mapear</SelectItem>
                      <SelectItem value="name">Nombre *</SelectItem>
                      <SelectItem value="email">Email *</SelectItem>
                      <SelectItem value="phone">Teléfono</SelectItem>
                      <SelectItem value="tax_id">NIF/CIF *</SelectItem>
                      <SelectItem value="address">Dirección</SelectItem>
                      <SelectItem value="city">Ciudad</SelectItem>
                      <SelectItem value="postal_code">Código Postal</SelectItem>
                      <SelectItem value="province">Provincia</SelectItem>
                      <SelectItem value="country">País</SelectItem>
                      <SelectItem value="sector">Sector *</SelectItem>
                      <SelectItem value="contact_person">Persona de Contacto</SelectItem>
                      <SelectItem value="website">Sitio Web</SelectItem>
                      <SelectItem value="notes">Notas</SelectItem>
                      <SelectItem value="commercial_name">Nombre Comercial</SelectItem>
                      <SelectItem value="administrator">Administrador</SelectItem>
                      <SelectItem value="administrator_nif">NIF Administrador</SelectItem>
                      <SelectItem value="commercial_agent">Agente Comercial</SelectItem>
                      <SelectItem value="available_credit">Crédito Disponible</SelectItem>
                      <SelectItem value="validated_credit">Crédito Validado</SelectItem>
                      <SelectItem value="social_security_accounts">Cuentas Seguridad Social</SelectItem>
                      <SelectItem value="is_sme">Es PYME</SelectItem>
                      <SelectItem value="is_new_creation">Nueva Creación</SelectItem>
                      <SelectItem value="creation_date">Fecha Creación</SelectItem>
                      <SelectItem value="previous_year_transactions">Transacciones Año Anterior</SelectItem>
                      <SelectItem value="phone_2">Teléfono 2</SelectItem>
                      <SelectItem value="documentation_email">Email Documentación</SelectItem>
                      <SelectItem value="issuers">Emisores</SelectItem>
                      <SelectItem value="has_rlt">Tiene RLT</SelectItem>
                      <SelectItem value="rlt_name">Nombre RLT</SelectItem>
                      <SelectItem value="rlt_nif">NIF RLT</SelectItem>
                      <SelectItem value="number_of_centers">Número de Centros</SelectItem>
                      <SelectItem value="centers_location">Ubicación Centros</SelectItem>
                      <SelectItem value="activity_description">Descripción Actividad</SelectItem>
                      <SelectItem value="advisory_firm">Asesoría</SelectItem>
                      <SelectItem value="advisory_contact">Contacto Asesoría</SelectItem>
                      <SelectItem value="consultant">Consultor</SelectItem>
                      <SelectItem value="collaborator">Colaborador</SelectItem>
                      <SelectItem value="telemarketing">Telemarketing</SelectItem>
                      <SelectItem value="telemarketing_observations">Observaciones Telemarketing</SelectItem>
                      <SelectItem value="central_observations">Observaciones Centrales</SelectItem>
                      <SelectItem value="other_observations">Otras Observaciones</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Se detectaron {Object.values(fieldMapping).filter(Boolean).length} campos mapeados automáticamente.
                Revisa y ajusta según sea necesario.
              </AlertDescription>
            </Alert>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              <Button
                onClick={generatePreview}
                disabled={!REQUIRED_FIELDS.every((field) => Object.values(fieldMapping).includes(field))}
              >
                Vista Previa
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Preview */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Paso 3: Vista Previa
            </CardTitle>
            <CardDescription>Revisa los primeros 10 registros antes de importar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-2 text-left">Nombre</th>
                    <th className="border border-border p-2 text-left">Email</th>
                    <th className="border border-border p-2 text-left">NIF/CIF</th>
                    <th className="border border-border p-2 text-left">Teléfono</th>
                    <th className="border border-border p-2 text-left">Sector</th>
                    <th className="border border-border p-2 text-left">Ciudad</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((customer, index) => (
                    <tr key={index} className="hover:bg-muted/50">
                      <td className="border border-border p-2">{customer.name}</td>
                      <td className="border border-border p-2">{customer.email}</td>
                      <td className="border border-border p-2">
                        <div className="flex items-center gap-2">
                          {customer.tax_id}
                          {customer.tax_id && validateSpanishTaxId(customer.tax_id) ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="border border-border p-2">{customer.phone}</td>
                      <td className="border border-border p-2">{customer.sector}</td>
                      <td className="border border-border p-2">{customer.city}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📊 Resumen de Importación</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-800 dark:text-blue-200">Total de registros:</span>
                  <div className="font-semibold">{parsedData.length}</div>
                </div>
                <div>
                  <span className="text-blue-800 dark:text-blue-200">Campos mapeados:</span>
                  <div className="font-semibold">{Object.values(fieldMapping).filter(Boolean).length}</div>
                </div>
                <div>
                  <span className="text-blue-800 dark:text-blue-200">Campos obligatorios:</span>
                  <div className="font-semibold">
                    {REQUIRED_FIELDS.filter((field) => Object.values(fieldMapping).includes(field)).length}/
                    {REQUIRED_FIELDS.length}
                  </div>
                </div>
                <div>
                  <span className="text-blue-800 dark:text-blue-200">Vista previa:</span>
                  <div className="font-semibold">{previewData.length} registros</div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              <Button onClick={processImport}>
                Iniciar Importación
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Processing */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Paso 4: Importando Datos
            </CardTitle>
            <CardDescription>Procesando {parsedData.length} registros...</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso de importación</span>
                <span>{Math.round(importProgress)}%</span>
              </div>
              <Progress value={importProgress} className="w-full" />
            </div>

            <div className="text-center text-muted-foreground">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Validando y guardando datos...</p>
              <p className="text-sm">Esto puede tomar unos momentos</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Results */}
      {currentStep === 5 && importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Paso 5: Resultados de Importación
            </CardTitle>
            <CardDescription>Resumen del proceso de importación completado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{importResult.success}</div>
                  <div className="text-sm text-muted-foreground">Importados</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{importResult.errors.length}</div>
                  <div className="text-sm text-muted-foreground">Errores</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{importResult.duplicates}</div>
                  <div className="text-sm text-muted-foreground">Duplicados</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{parsedData.length}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </CardContent>
              </Card>
            </div>

            {/* Errores */}
            {importResult.errors.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-red-600">Errores Encontrados</h3>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {importResult.errors.map((error, index) => (
                    <Alert key={index} variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Fila {error.row}:</strong> {error.message}
                        {error.value && <span className="ml-2 font-mono text-xs">({error.value})</span>}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {/* Advertencias */}
            {importResult.warnings.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-yellow-600">Advertencias</h3>
                <div className="space-y-2">
                  {importResult.warnings.map((warning, index) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{warning}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {/* Éxito */}
            {importResult.success > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>¡Importación exitosa!</strong> Se importaron {importResult.success} clientes correctamente.
                  Puedes verlos en la sección de clientes.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={resetProcess}>
                Nueva Importación
              </Button>
              <div className="space-x-2">
                <Link href="/customers">
                  <Button>
                    Ver Clientes
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
