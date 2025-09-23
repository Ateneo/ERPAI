"use client"

import { useEffect, useState } from "react"

interface VerifactuQRProps {
  nif: string
  numeroSerie: string
  fecha: string // YYYY-MM-DD
  importe: number
}

export function VerifactuQR({ nif, numeroSerie, fecha, importe }: VerifactuQRProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState("")

  useEffect(() => {
    generateQRCode()
  }, [nif, numeroSerie, fecha, importe])

  const generateQRCode = () => {
    try {
      // Formatear la fecha a DD-MM-YYYY
      const fechaFormateada = new Date(fecha).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })

      // Formatear el importe con punto decimal y máximo 2 decimales
      const importeFormateado = importe.toFixed(2)

      // Codificar los parámetros para URL
      const params = new URLSearchParams({
        nif: nif,
        numserie: numeroSerie,
        fecha: fechaFormateada,
        importe: importeFormateado,
      })

      // URL base del servicio de cotejo de la AEAT (esta es la URL oficial)
      const baseUrl = "https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQR"
      const verifactuUrl = `${baseUrl}?${params.toString()}`

      // Usar un servicio online para generar el QR (compatible con v0)
      // qr-server.com es un servicio gratuito que genera códigos QR
      const qrServiceUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&ecc=M&data=${encodeURIComponent(verifactuUrl)}`

      setQrCodeUrl(qrServiceUrl)
    } catch (error) {
      console.error("Error generando código QR Verifactu:", error)
      // Fallback a un placeholder si hay error
      setQrCodeUrl("/placeholder.svg?height=150&width=150")
    }
  }

  return (
    <div className="space-y-2">
      <div className="border rounded p-2 bg-white">
        <img
          src={qrCodeUrl || "/placeholder.svg?height=150&width=150"}
          alt="Código QR Verifactu"
          className="w-32 h-32 mx-auto"
          onError={(e) => {
            // Si falla la carga del QR, mostrar placeholder
            e.currentTarget.src = "/placeholder.svg?height=150&width=150"
          }}
        />
      </div>
      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          <strong>NIF:</strong> {nif}
        </p>
        <p>
          <strong>Núm.:</strong> {numeroSerie}
        </p>
        <p>
          <strong>Fecha:</strong> {new Date(fecha).toLocaleDateString("es-ES")}
        </p>
        <p>
          <strong>Importe:</strong> €{importe.toFixed(2)}
        </p>
      </div>
      <div className="text-xs text-center text-muted-foreground">
        <p>Código QR Verifactu - AEAT</p>
        <p className="break-all text-[10px] mt-1">
          URL: https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQR?nif={nif}&numserie={numeroSerie}&fecha=
          {new Date(fecha).toLocaleDateString("es-ES")}&importe={importe.toFixed(2)}
        </p>
      </div>
    </div>
  )
}
