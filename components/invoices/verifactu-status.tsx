"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Clock, Send, XCircle, AlertTriangle, FileText, RefreshCw, ExternalLink } from "lucide-react"
import { useVerifactu } from "@/hooks/use-verifactu"

interface VerifactuStatusProps {
  invoice: {
    id: string
    invoice_number: string
    verifactu_id?: string
    verifactu_status?: string
    hacienda_status?: string
    status: string
  }
  onStatusUpdate?: (newStatus: any) => void
}

const statusConfig = {
  draft: {
    label: "Borrador",
    color: "bg-gray-500",
    icon: FileText,
    description: "Factura local, no enviada a Verifactu",
  },
  pending: {
    label: "Pendiente",
    color: "bg-yellow-500",
    icon: Clock,
    description: "Creada en Verifactu, pendiente de envío a Hacienda",
  },
  sent: {
    label: "Enviada",
    color: "bg-blue-500",
    icon: Send,
    description: "Enviada a Hacienda, esperando confirmación",
  },
  accepted: {
    label: "Aceptada",
    color: "bg-green-500",
    icon: CheckCircle,
    description: "Confirmada por Hacienda",
  },
  rejected: {
    label: "Rechazada",
    color: "bg-red-500",
    icon: XCircle,
    description: "Rechazada por Hacienda",
  },
  error: {
    label: "Error",
    color: "bg-red-600",
    icon: AlertTriangle,
    description: "Error en el proceso",
  },
}

export function VerifactuStatus({ invoice, onStatusUpdate }: VerifactuStatusProps) {
  const [currentStatus, setCurrentStatus] = useState(invoice.verifactu_status || invoice.status || "draft")
  const [haciendaStatus, setHaciendaStatus] = useState(invoice.hacienda_status)
  const [autoCheck, setAutoCheck] = useState(false)

  const { loading, error, success, createInvoice, sendToHacienda, checkHaciendaStatus, cancelInvoice, resetState } =
    useVerifactu()

  // Auto-verificación cada 30 segundos para facturas enviadas
  useEffect(() => {
    if (currentStatus === "sent" && invoice.verifactu_id && autoCheck) {
      const interval = setInterval(async () => {
        try {
          const status = await checkHaciendaStatus(invoice.verifactu_id!)
          if (status.hacienda_status !== haciendaStatus) {
            setHaciendaStatus(status.hacienda_status)
            setCurrentStatus(status.hacienda_status)
            onStatusUpdate?.(status)
          }
        } catch (error) {
          console.error("Error verificando estado:", error)
        }
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [currentStatus, invoice.verifactu_id, autoCheck, haciendaStatus, checkHaciendaStatus, onStatusUpdate])

  const handleCreateInVerifactu = async () => {
    try {
      resetState()
      const result = await createInvoice({
        invoice_number: invoice.invoice_number,
        customer_id: "temp_customer_id", // Esto debería venir de los datos reales
        issue_date: new Date().toISOString().split("T")[0],
        subtotal: 100, // Datos de ejemplo
        tax_amount: 21,
        total_amount: 121,
        currency: "EUR",
        items: [
          {
            description: "Servicio de ejemplo",
            quantity: 1,
            unit_price: 100,
            tax_rate: 21,
            total: 121,
          },
        ],
      })

      setCurrentStatus("pending")
      onStatusUpdate?.({ verifactu_id: result.id, verifactu_status: "pending" })
    } catch (error) {
      console.error("Error creando factura en Verifactu:", error)
    }
  }

  const handleSendToHacienda = async () => {
    if (!invoice.verifactu_id) return

    try {
      resetState()
      await sendToHacienda(invoice.verifactu_id)
      setCurrentStatus("sent")
      setAutoCheck(true)
      onStatusUpdate?.({ verifactu_status: "sent" })
    } catch (error) {
      console.error("Error enviando a Hacienda:", error)
      setCurrentStatus("error")
    }
  }

  const handleCheckStatus = async () => {
    if (!invoice.verifactu_id) return

    try {
      resetState()
      const status = await checkHaciendaStatus(invoice.verifactu_id)
      setHaciendaStatus(status.hacienda_status)
      setCurrentStatus(status.hacienda_status || status.status)
      onStatusUpdate?.(status)
    } catch (error) {
      console.error("Error verificando estado:", error)
    }
  }

  const handleCancel = async () => {
    if (!invoice.verifactu_id) return

    try {
      resetState()
      await cancelInvoice(invoice.verifactu_id, "Cancelación solicitada por el usuario")
      setCurrentStatus("draft")
      onStatusUpdate?.({ verifactu_status: "cancelled" })
    } catch (error) {
      console.error("Error cancelando factura:", error)
    }
  }

  const config = statusConfig[currentStatus as keyof typeof statusConfig] || statusConfig.draft
  const Icon = config.icon

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          Estado Verifactu
          {autoCheck && <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado actual */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={`${config.color} text-white`}>
              <Icon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
            {invoice.verifactu_id && (
              <Badge variant="outline" className="text-xs">
                ID: {invoice.verifactu_id.slice(-8)}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={handleCheckStatus} disabled={loading || !invoice.verifactu_id}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Descripción */}
        <p className="text-sm text-gray-600">{config.description}</p>

        {/* Estado de Hacienda */}
        {haciendaStatus && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Estado Hacienda:</span>
            <Badge variant="outline">{haciendaStatus}</Badge>
          </div>
        )}

        {/* Errores */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Éxito */}
        {success && !error && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Operación completada correctamente</AlertDescription>
          </Alert>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2 flex-wrap">
          {currentStatus === "draft" && (
            <Button onClick={handleCreateInVerifactu} disabled={loading} size="sm">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Crear en Verifactu
            </Button>
          )}

          {currentStatus === "pending" && (
            <Button onClick={handleSendToHacienda} disabled={loading} size="sm">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Enviar a Hacienda
            </Button>
          )}

          {currentStatus === "sent" && (
            <Button variant="outline" onClick={handleCheckStatus} disabled={loading} size="sm">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Verificar Estado
            </Button>
          )}

          {(currentStatus === "pending" || currentStatus === "sent") && (
            <Button variant="destructive" onClick={handleCancel} disabled={loading} size="sm">
              <XCircle className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          )}

          {currentStatus === "accepted" && (
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver en Hacienda
            </Button>
          )}
        </div>

        {/* Información adicional */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>Factura: {invoice.invoice_number}</div>
          {invoice.verifactu_id && <div>ID Verifactu: {invoice.verifactu_id}</div>}
          {autoCheck && <div>✓ Verificación automática activada</div>}
        </div>
      </CardContent>
    </Card>
  )
}
