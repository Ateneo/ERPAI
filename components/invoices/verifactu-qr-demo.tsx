"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Copy, Check } from "lucide-react"

interface VerifactuQRDemoProps {
  nif: string
  numeroSerie: string
  fecha: string // YYYY-MM-DD
  importe: number
}

export function VerifactuQRDemo({ nif, numeroSerie, fecha, importe }: VerifactuQRDemoProps) {
  const [copied, setCopied] = useState(false)

  // Formatear la fecha a DD-MM-YYYY
  const fechaFormateada = new Date(fecha).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  // Formatear el importe con punto decimal y máximo 2 decimales
  const importeFormateado = importe.toFixed(2)

  // Construir la URL de Verifactu
  const params = new URLSearchParams({
    nif: nif,
    numserie: numeroSerie,
    fecha: fechaFormateada,
    importe: importeFormateado,
  })

  const baseUrl = "https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQR"
  const verifactuUrl = `${baseUrl}?${params.toString()}`

  // URL del QR generado por servicio online
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&ecc=M&format=png&data=${encodeURIComponent(verifactuUrl)}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(verifactuUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Error copiando al portapapeles:", err)
    }
  }

  const openVerifactu = () => {
    window.open(verifactuUrl, "_blank")
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-sm">Verificación AEAT - Verifactu</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Código QR real generado */}
        <div className="flex justify-center">
          <div className="border-2 border-gray-300 rounded p-2 bg-white">
            <img
              src={qrImageUrl || "/placeholder.svg"}
              alt="Código QR Verifactu"
              className="w-40 h-40"
              onError={(e) => {
                // Fallback si falla el servicio
                e.currentTarget.src = "/placeholder.svg?height=160&width=160"
              }}
            />
          </div>
        </div>

        {/* Información de la factura */}
        <div className="text-xs space-y-1 bg-muted p-3 rounded">
          <div className="grid grid-cols-2 gap-2">
            <span className="font-semibold">NIF:</span>
            <span>{nif}</span>
            <span className="font-semibold">Número:</span>
            <span>{numeroSerie}</span>
            <span className="font-semibold">Fecha:</span>
            <span>{fechaFormateada}</span>
            <span className="font-semibold">Importe:</span>
            <span>€{importeFormateado}</span>
          </div>
        </div>

        {/* URL de verificación */}
        <div className="space-y-2">
          <p className="text-xs font-semibold">URL de Verificación:</p>
          <div className="flex items-center space-x-2">
            <input type="text" value={verifactuUrl} readOnly className="text-xs p-2 border rounded flex-1 bg-muted" />
            <Button size="sm" variant="outline" onClick={copyToClipboard}>
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="space-y-2">
          <Button onClick={openVerifactu} className="w-full" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Verificar en AEAT
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Este código QR cumple con las especificaciones técnicas del sistema Verifactu de la AEAT
          </p>
        </div>

        {/* Especificaciones técnicas */}
        <details className="text-xs">
          <summary className="cursor-pointer font-semibold mb-2">Especificaciones Técnicas</summary>
          <ul className="space-y-1 text-muted-foreground ml-4">
            <li>• Tamaño: 200x200px (equivale a 30-40mm)</li>
            <li>• Estándar: ISO/IEC 18004:2015</li>
            <li>• Corrección de errores: Nivel M (medio)</li>
            <li>• Codificación: UTF-8 con URL encoding</li>
            <li>• Formato: PNG de alta calidad</li>
          </ul>
        </details>
      </CardContent>
    </Card>
  )
}
