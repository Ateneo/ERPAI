"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft, Download, Loader2 } from "lucide-react"
import { preventaService, type PreventaInput } from "@/lib/supabase-preventas"

interface ParsedRecord {
  raw: Record<string, string>
  mapped: Partial<PreventaInput>
  errors: string[]
  isValid: boolean
}

const FIELD_MAPPINGS: Record<string, keyof PreventaInput> = {
  numero_presupuesto: "numero_presupuesto",
  "nº presupuesto": "numero_presupuesto",
  "n presupuesto": "numero_presupuesto",
  presupuesto: "numero_presupuesto",
  cliente: "cliente_nombre",
  cliente_nombre: "cliente_nombre",
  nombre_cliente: "cliente_nombre",
  colaborador: "colaborador",
  telemarketing: "telemarketing",
  fecha_venta: "fecha_venta",
  "fecha venta": "fecha_venta",
  fecha_facturar: "fecha_facturar",
  "fecha facturar": "fecha_facturar",
  tipo_vencimiento: "tipo_vencimiento",
  "tipo vencimiento": "tipo_vencimiento",
  fecha_vencimiento: "fecha_vencimiento",
  "fecha vencimiento": "fecha_vencimiento",
  comercial: "comercial",
  tipo_contrato: "tipo_contrato",
  "tipo contrato": "tipo_contrato",
  tiempo_contrato: "tiempo_contrato",
  "tiempo contrato": "tiempo_contrato",
  importe_total: "importe_total",
  "importe total": "importe_total",
  total: "importe_total",
  observaciones: "observaciones",
  estado: "estado",
}

export default function ImportPreventasPage() {
  const router = useRouter()
  const [step, setStep] = useState<"upload" | "preview" | "importing" | "complete">("upload")
  const [records, setRecords] = useState<ParsedRecord[]>([])
  const [results, setResults] = useState<{ success: number; errors: number }>({ success: 0, errors: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const parseCSV = (content: string): Record<string, string>[] => {
    const lines = content.trim().split("\n")
    if (lines.length < 2) return []

    const separator = lines[0].includes(";") ? ";" : lines[0].includes("\t") ? "\t" : ","
    const headers = lines[0].split(separator).map((h) =>
      h
        .trim()
        .replace(/^["']|["']$/g, "")
        .toLowerCase(),
    )

    return lines.slice(1).map((line) => {
      const values = line.split(separator).map((v) => v.trim().replace(/^["']|["']$/g, ""))
      const record: Record<string, string> = {}
      headers.forEach((header, index) => {
        record[header] = values[index] || ""
      })
      return record
    })
  }

  const mapRecord = (raw: Record<string, string>): ParsedRecord => {
    const mapped: Partial<PreventaInput> = {}
    const errors: string[] = []

    // Map fields
    Object.entries(raw).forEach(([key, value]) => {
      const normalizedKey = key.toLowerCase().trim()
      const targetField = FIELD_MAPPINGS[normalizedKey]
      if (targetField && value) {
        if (targetField === "importe_total") {
          mapped[targetField] = Number.parseFloat(value.replace(",", ".")) || 0
        } else if (targetField === "tipo_contrato") {
          mapped[targetField] = value.toLowerCase().includes("colaborador") ? "colaborador" : "cliente"
        } else if (targetField === "tiempo_contrato") {
          mapped[targetField] = value.toLowerCase().includes("mantenimiento") ? "año_mantenimiento" : "año"
        } else {
          ;(mapped as any)[targetField] = value
        }
      }
    })

    // Validations
    if (!mapped.cliente_nombre) {
      errors.push("Cliente es obligatorio")
    }

    return {
      raw,
      mapped,
      errors,
      isValid: errors.length === 0,
    }
  }

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const rawRecords = parseCSV(content)
      const parsedRecords = rawRecords.map(mapRecord)
      setRecords(parsedRecords)
      setStep("preview")
    }
    reader.readAsText(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file && (file.name.endsWith(".csv") || file.name.endsWith(".txt"))) {
        handleFile(file)
      }
    },
    [handleFile],
  )

  const handleImport = async () => {
    setStep("importing")
    const validRecords = records.filter((r) => r.isValid).map((r) => r.mapped)
    const result = await preventaService.importFromCSV(validRecords as PreventaInput[])
    setResults(result)
    setStep("complete")
  }

  const downloadTemplate = () => {
    const headers = [
      "numero_presupuesto",
      "cliente_nombre",
      "colaborador",
      "telemarketing",
      "fecha_venta",
      "fecha_facturar",
      "tipo_vencimiento",
      "fecha_vencimiento",
      "comercial",
      "tipo_contrato",
      "tiempo_contrato",
      "importe_total",
      "observaciones",
      "estado",
    ]
    const csv = headers.join(";") + "\n"
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "plantilla_preventas.csv"
    link.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/preventas")} className="neu-icon-sm">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Importar Preventas
          </h1>
          <p className="text-muted-foreground">Importa preventas desde un archivo CSV</p>
        </div>
      </div>

      {step === "upload" && (
        <div className="neu-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Subir archivo CSV</h3>
            <button onClick={downloadTemplate} className="neu-button-secondary flex items-center gap-2">
              <Download className="h-4 w-4" />
              Descargar plantilla
            </button>
          </div>

          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-border"
            }`}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className="neu-icon mx-auto mb-4 w-16 h-16">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Arrastra tu archivo CSV aquí</h3>
            <p className="text-muted-foreground mb-4">o haz clic para seleccionar</p>
            <input
              type="file"
              accept=".csv,.txt"
              className="hidden"
              id="file-input"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />
            <label htmlFor="file-input" className="neu-button-primary cursor-pointer inline-flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Seleccionar archivo
            </label>
          </div>
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-6">
          <div className="neu-card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Vista previa ({records.length} registros)</h3>
              <div className="flex gap-2">
                <span className="neu-badge bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                  {records.filter((r) => r.isValid).length} válidos
                </span>
                <span className="neu-badge bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                  {records.filter((r) => !r.isValid).length} con errores
                </span>
              </div>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Estado</th>
                    <th className="text-left py-2 px-2">Nº Presupuesto</th>
                    <th className="text-left py-2 px-2">Cliente</th>
                    <th className="text-left py-2 px-2">Comercial</th>
                    <th className="text-right py-2 px-2">Importe</th>
                    <th className="text-left py-2 px-2">Errores</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr key={index} className="border-b border-border/10">
                      <td className="py-2 px-2">
                        {record.isValid ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                      </td>
                      <td className="py-2 px-2">{record.mapped.numero_presupuesto || "-"}</td>
                      <td className="py-2 px-2">{record.mapped.cliente_nombre || "-"}</td>
                      <td className="py-2 px-2">{record.mapped.comercial || "-"}</td>
                      <td className="py-2 px-2 text-right">{record.mapped.importe_total?.toFixed(2) || "0.00"} €</td>
                      <td className="py-2 px-2 text-red-600 text-xs">{record.errors.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button onClick={() => setStep("upload")} className="neu-button-secondary">
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={records.filter((r) => r.isValid).length === 0}
              className="neu-button-primary flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Importar {records.filter((r) => r.isValid).length} registros
            </button>
          </div>
        </div>
      )}

      {step === "importing" && (
        <div className="neu-card text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Importando preventas...</h3>
          <p className="text-muted-foreground">Por favor, espera mientras se procesan los registros.</p>
        </div>
      )}

      {step === "complete" && (
        <div className="neu-card text-center py-12">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Importación completada</h3>
          <div className="flex justify-center gap-4 mb-6">
            <span className="neu-badge bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
              {results.success} importados
            </span>
            {results.errors > 0 && (
              <span className="neu-badge bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                {results.errors} errores
              </span>
            )}
          </div>
          <button onClick={() => router.push("/preventas")} className="neu-button-primary">
            Ir a Preventas
          </button>
        </div>
      )}
    </div>
  )
}
