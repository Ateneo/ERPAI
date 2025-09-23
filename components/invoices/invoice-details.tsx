"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Download, Send, Edit, Trash2 } from "lucide-react"
import { InvoicePreview } from "./invoice-preview"
import { EmailConfirmationModal } from "./email-confirmation-modal"
import { jsPDF } from "jspdf"
import "jspdf-autotable"

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-red-100 text-red-800",
}

const statusLabels = {
  draft: "Borrador",
  sent: "Enviada",
  paid: "Pagada",
  overdue: "Vencida",
  cancelled: "Cancelada",
}

const companyData = {
  name: "Flowers&Saints S.L.",
  address: "Calle Ejemplo 123",
  city: "Madrid",
  postal_code: "28001",
  tax_id: "B12345678",
  phone: "+34 912 345 678",
  email: "info@flowerssaints.com",
}

export function InvoiceDetails({ invoice, customer, onBack }) {
  const [showEmailModal, setShowEmailModal] = useState(false)

  const handleDownloadPDF = () => {
    try {
      // Crear nuevo documento PDF
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Añadir título y datos de la empresa
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text("FACTURA", 105, 20, { align: "center" })
      doc.text(`${invoice.invoice_number}`, 105, 30, { align: "center" })

      // Añadir estado de la factura
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(invoice.status === "paid" ? 0 : 0, invoice.status === "paid" ? 128 : 0, 0)
      doc.text(`Estado: ${statusLabels[invoice.status]}`, 105, 38, { align: "center" })
      doc.setTextColor(0, 0, 0)

      // Datos de la empresa
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("DATOS DEL EMISOR:", 20, 50)
      doc.setFont("helvetica", "normal")
      doc.text(`${companyData.name}`, 20, 55)
      doc.text(`${companyData.address}`, 20, 60)
      doc.text(`${companyData.city}, ${companyData.postal_code}`, 20, 65)
      doc.text(`NIF/CIF: ${companyData.tax_id}`, 20, 70)
      doc.text(`Teléfono: ${companyData.phone}`, 20, 75)
      doc.text(`Email: ${companyData.email}`, 20, 80)

      // Datos del cliente
      doc.setFont("helvetica", "bold")
      doc.text("DATOS DEL CLIENTE:", 120, 50)
      doc.setFont("helvetica", "normal")
      doc.text(`${customer?.name || "Cliente"}`, 120, 55)
      doc.text(`NIF/CIF: ${customer?.tax_id || ""}`, 120, 60)
      doc.text(`Email: ${customer?.email || ""}`, 120, 65)
      doc.text(`Teléfono: ${customer?.phone || ""}`, 120, 70)

      // Datos de la factura
      doc.setFont("helvetica", "bold")
      doc.text("DATOS DE LA FACTURA:", 20, 95)
      doc.setFont("helvetica", "normal")
      doc.text(`Fecha de emisión: ${new Date(invoice.issue_date).toLocaleDateString("es-ES")}`, 20, 100)
      doc.text(`Fecha de vencimiento: ${new Date(invoice.due_date).toLocaleDateString("es-ES")}`, 20, 105)
      doc.text(`Moneda: ${invoice.currency}`, 20, 110)

      // Datos de ejemplo para las líneas de factura
      const invoiceItems = [
        { description: "Consultoría IT", quantity: 10, unit_price: 75.0, tax_rate: 21, line_total: 907.5 },
        { description: "Desarrollo Web", quantity: 8, unit_price: 85.0, tax_rate: 21, line_total: 823.6 },
      ]

      // Crear tabla de productos
      const tableColumn = ["Descripción", "Cantidad", "Precio Unitario", "IVA %", "Total"]
      const tableRows = invoiceItems.map((item) => [
        item.description,
        item.quantity.toString(),
        `€${item.unit_price.toFixed(2)}`,
        `${item.tax_rate}%`,
        `€${item.line_total.toFixed(2)}`,
      ])

      // Añadir tabla al PDF
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 120,
        theme: "grid",
        headStyles: {
          fillColor: [220, 220, 220],
          textColor: [0, 0, 0],
          fontStyle: "bold",
        },
        styles: {
          fontSize: 9,
        },
      })

      // Calcular totales
      const subtotal = (invoice.total_amount / 1.21).toFixed(2)
      const iva = (invoice.total_amount - invoice.total_amount / 1.21).toFixed(2)
      const total = invoice.total_amount.toFixed(2)

      // Añadir totales
      const finalY = (doc as any).lastAutoTable.finalY + 10

      doc.setFont("helvetica", "normal")
      doc.text("Subtotal:", 140, finalY)
      doc.text("IVA (21%):", 140, finalY + 5)
      doc.setFont("helvetica", "bold")
      doc.text("TOTAL:", 140, finalY + 10)

      doc.setFont("helvetica", "normal")
      doc.text(`€${subtotal}`, 170, finalY, { align: "right" })
      doc.text(`€${iva}`, 170, finalY + 5, { align: "right" })
      doc.setFont("helvetica", "bold")
      doc.text(`€${total}`, 170, finalY + 10, { align: "right" })

      // Añadir notas
      if (invoice.notes) {
        doc.setFont("helvetica", "bold")
        doc.text("NOTAS:", 20, finalY + 20)
        doc.setFont("helvetica", "normal")
        doc.text(invoice.notes, 20, finalY + 25)
      }

      // Añadir pie de página
      doc.setFontSize(8)
      doc.text("Este documento es una factura electrónica válida según la normativa vigente.", 105, 280, {
        align: "center",
      })
      doc.text(
        `Generado el ${new Date().toLocaleDateString("es-ES")} a las ${new Date().toLocaleTimeString("es-ES")}`,
        105,
        285,
        { align: "center" },
      )

      // Guardar PDF
      const fileName = `Factura_${invoice.invoice_number}_${customer?.name || "Cliente"}.pdf`
      doc.save(fileName)

      console.log("PDF generado y descargado:", fileName)
    } catch (error) {
      console.error("Error al generar el PDF:", error)
    }
  }

  const handleSendEmail = () => {
    setShowEmailModal(true)
  }

  const handleEdit = () => {
    console.log("Editando factura:", invoice.invoice_number)
  }

  const handleDelete = () => {
    console.log("Eliminando factura:", invoice.invoice_number)
  }

  // Datos de ejemplo para las líneas de factura
  const invoiceItems = [
    { description: "Consultoría IT", quantity: 10, unit_price: 75.0, tax_rate: 21, line_total: 907.5 },
    { description: "Desarrollo Web", quantity: 8, unit_price: 85.0, tax_rate: 21, line_total: 823.6 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a la lista
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
          <Button variant="outline" onClick={handleSendEmail}>
            <Send className="h-4 w-4 mr-2" />
            Enviar por Email
          </Button>
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Factura {invoice.invoice_number}</CardTitle>
            <Badge className={statusColors[invoice.status]}>{statusLabels[invoice.status]}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Datos del Cliente</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Nombre:</strong> {customer?.name}
                </p>
                <p>
                  <strong>Email:</strong> {customer?.email}
                </p>
                <p>
                  <strong>NIF/CIF:</strong> {customer?.tax_id}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Datos de la Factura</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Fecha de emisión:</strong> {new Date(invoice.issue_date).toLocaleDateString("es-ES")}
                </p>
                <p>
                  <strong>Fecha de vencimiento:</strong> {new Date(invoice.due_date).toLocaleDateString("es-ES")}
                </p>
                <p>
                  <strong>Moneda:</strong> {invoice.currency}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Líneas de Factura</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Precio Unitario</TableHead>
                  <TableHead>IVA %</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoiceItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>€{item.unit_price.toFixed(2)}</TableCell>
                    <TableCell>{item.tax_rate}%</TableCell>
                    <TableCell>€{item.line_total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="border-t pt-4">
            <div className="space-y-2 text-right">
              <div className="flex justify-end space-x-4">
                <span>Subtotal:</span>
                <span>€{(invoice.total_amount / 1.21).toFixed(2)}</span>
              </div>
              <div className="flex justify-end space-x-4">
                <span>IVA (21%):</span>
                <span>€{(invoice.total_amount - invoice.total_amount / 1.21).toFixed(2)}</span>
              </div>
              <div className="flex justify-end space-x-4 text-lg font-bold">
                <span>Total:</span>
                <span>€{invoice.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div>
              <h3 className="font-semibold mb-2">Notas</h3>
              <p className="text-sm text-muted-foreground">{invoice.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <InvoicePreview invoice={invoice} customer={customer} company={companyData} items={invoiceItems} />
      </div>

      <EmailConfirmationModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        invoice={invoice}
        customer={customer}
        type="invoice"
      />
    </div>
  )
}
