"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Mail, FileText, AlertCircle, CheckCircle } from "lucide-react"
import { useEmailSender } from "@/hooks/use-email-sender"

interface EmailConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  invoice: any
  customer: any
  type?: "invoice" | "quote"
}

export function EmailConfirmationModal({
  isOpen,
  onClose,
  invoice,
  customer,
  type = "invoice",
}: EmailConfirmationModalProps) {
  const [email, setEmail] = useState(customer?.email || "")
  const [subject, setSubject] = useState("")
  const [includePDF, setIncludePDF] = useState(true)
  const [customMessage, setCustomMessage] = useState("")
  const [sent, setSent] = useState(false)

  const { sendEmail, isLoading, error } = useEmailSender()

  const documentType = type === "invoice" ? "factura" : "presupuesto"
  const documentTypeCapitalized = type === "invoice" ? "Factura" : "Presupuesto"

  // Inicializar el asunto cuando se abre el modal
  useState(() => {
    if (isOpen && invoice) {
      setSubject(`${documentTypeCapitalized} ${invoice.invoice_number} - Flowers&Saints S.L.`)
    }
  }, [isOpen, invoice, documentTypeCapitalized])

  const handleSend = async () => {
    try {
      await sendEmail({
        invoice,
        customer: { ...customer, email },
        type,
        customMessage,
      })
      setSent(true)
      setTimeout(() => {
        setSent(false)
        onClose()
      }, 2000)
    } catch (err) {
      // Error manejado por el hook
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setSent(false)
      onClose()
    }
  }

  if (sent) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">¡Email Enviado!</h3>
            <p className="text-muted-foreground text-center">
              La {documentType} ha sido enviada correctamente a {email}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Enviar {documentTypeCapitalized} por Email
          </DialogTitle>
          <DialogDescription>
            Enviar {documentType} #{invoice?.invoice_number} a {customer?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email del destinatario</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@ejemplo.com"
            />
          </div>

          <div>
            <Label htmlFor="subject">Asunto</Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="includePDF" checked={includePDF} onCheckedChange={setIncludePDF} />
            <Label htmlFor="includePDF" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Incluir PDF como adjunto
            </Label>
          </div>

          <div>
            <Label htmlFor="message">Mensaje personalizado (opcional)</Label>
            <Textarea
              id="message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Añadir un mensaje personalizado al email..."
              rows={3}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-700">
              <strong>Vista previa:</strong> Se enviará un email profesional con los datos de la {documentType},
              información de contacto y {includePDF ? "el PDF adjunto" : "sin adjuntos"}.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={isLoading || !email}>
            {isLoading ? "Enviando..." : `Enviar ${documentTypeCapitalized}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
