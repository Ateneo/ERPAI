"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, Download, FileSpreadsheet, Check, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { SupabaseServiceService } from "@/lib/supabase-services"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

interface ParsedService {
  code: string
  name: string
  price: number
  category: string
  customer_name: string
  active: boolean
  valid: boolean
  errors: string[]
}

export default function ImportServicesPage() {
  const [step, setStep] = useState<"upload" | "preview" | "importing" | "complete">("upload")
  const [parsedData, setParsedData] = useState<ParsedService[]>([])
  const [importResults, setImportResults] = useState({ success: 0, failed: 0, total: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const downloadTemplate = () => {
    const headers = ["codigo", "nombre", "precio", "categoria", "cliente", "activo"]
    const example = ["S0001", "IMPLANTACION PROTECCION DE DATOS", "500.00", "Protección de Datos", "Cliente Demo", "Si"]
    const csv = [headers.join(";"), example.join(";")].join("\n")

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "plantilla_servicios.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()
    const lines = text.split("\n").filter((line) => line.trim())
    const headers = lines[0].toLowerCase().split(/[;,\t]/)

    const codeIdx = headers.findIndex((h) => h.includes("codigo") || h.includes("code") || h.includes("nº"))
    const nameIdx = headers.findIndex((h) => h.includes("nombre") || h.includes("servicio") || h.includes("name"))
    const priceIdx = headers.findIndex((h) => h.includes("precio") || h.includes("price") || h.includes("importe"))
    const categoryIdx = headers.findIndex((h) => h.includes("categoria") || h.includes("category"))
    const customerIdx = headers.findIndex(
      (h) => h.includes("cliente") || h.includes("customer") || h.includes("facturacion"),
    )
    const activeIdx = headers.findIndex((h) => h.includes("activo") || h.includes("active"))

    const parsed: ParsedService[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(/[;,\t]/)
      const errors: string[] = []

      const name = nameIdx >= 0 ? values[nameIdx]?.trim() : ""
      const priceStr = priceIdx >= 0 ? values[priceIdx]?.trim().replace(",", ".") : "0"
      const price = Number.parseFloat(priceStr) || 0
      const activeStr = activeIdx >= 0 ? values[activeIdx]?.trim().toLowerCase() : "si"

      if (!name) errors.push("Nombre requerido")
      if (price < 0) errors.push("Precio inválido")

      parsed.push({
        code: codeIdx >= 0 ? values[codeIdx]?.trim() : "",
        name,
        price,
        category: categoryIdx >= 0 ? values[categoryIdx]?.trim() : "",
        customer_name: customerIdx >= 0 ? values[customerIdx]?.trim() : "",
        active: ["si", "sí", "yes", "1", "true", "activo"].includes(activeStr),
        valid: errors.length === 0,
        errors,
      })
    }

    setParsedData(parsed)
    setStep("preview")
  }

  const handleImport = async () => {
    setStep("importing")
    let success = 0
    let failed = 0

    // Get customers for matching
    const { data: customers } = await supabase.from("customers").select("id, name")
    const customerMap = new Map((customers || []).map((c) => [c.name.toLowerCase(), c.id]))

    for (const service of parsedData.filter((s) => s.valid)) {
      try {
        const customerId = service.customer_name ? customerMap.get(service.customer_name.toLowerCase()) : undefined

        await SupabaseServiceService.create({
          code: service.code || undefined,
          name: service.name,
          price: service.price,
          category: service.category || undefined,
          customer_id: customerId,
          active: service.active,
        })
        success++
      } catch {
        failed++
      }
    }

    setImportResults({ success, failed, total: parsedData.filter((s) => s.valid).length })
    setStep("complete")
  }

  const validCount = parsedData.filter((s) => s.valid).length
  const invalidCount = parsedData.filter((s) => !s.valid).length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/services">
          <Button variant="ghost" className="neu-button-sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Importar Servicios</h1>
          <p className="text-muted-foreground">Importa servicios desde un archivo CSV</p>
        </div>
      </div>

      {step === "upload" && (
        <Card className="neu-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Subir archivo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors neu-inset"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">Arrastra un archivo CSV aquí</p>
              <p className="text-sm text-muted-foreground mt-1">o haz clic para seleccionar</p>
              <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
            </div>

            <div className="flex justify-center">
              <Button variant="outline" onClick={downloadTemplate} className="neu-button bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Descargar plantilla CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "preview" && (
        <Card className="neu-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Vista previa ({parsedData.length} registros)</span>
              <div className="flex gap-2">
                <Badge variant="default" className="neu-badge">
                  <Check className="h-3 w-3 mr-1" />
                  {validCount} válidos
                </Badge>
                {invalidCount > 0 && (
                  <Badge variant="destructive" className="neu-badge">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {invalidCount} con errores
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estado</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Cliente</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 50).map((service, idx) => (
                    <TableRow key={idx} className={service.valid ? "" : "bg-destructive/10"}>
                      <TableCell>
                        {service.valid ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                      </TableCell>
                      <TableCell className="font-mono">{service.code || "(auto)"}</TableCell>
                      <TableCell>{service.name}</TableCell>
                      <TableCell>{service.price.toFixed(2)} €</TableCell>
                      <TableCell>{service.category}</TableCell>
                      <TableCell>{service.customer_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setStep("upload")} className="neu-button">
                Cancelar
              </Button>
              <Button onClick={handleImport} disabled={validCount === 0} className="neu-button-primary">
                Importar {validCount} servicios
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "importing" && (
        <Card className="neu-card">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-lg font-medium">Importando servicios...</p>
          </CardContent>
        </Card>
      )}

      {step === "complete" && (
        <Card className="neu-card">
          <CardContent className="py-12 text-center">
            <Check className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p className="text-lg font-medium">Importación completada</p>
            <p className="text-muted-foreground mt-2">
              {importResults.success} de {importResults.total} servicios importados correctamente
            </p>
            <div className="flex justify-center gap-3 mt-6">
              <Link href="/services">
                <Button className="neu-button-primary">Ver servicios</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
