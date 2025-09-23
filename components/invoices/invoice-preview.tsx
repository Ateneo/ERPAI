"use client"

import { useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, PrinterIcon as Print } from "lucide-react"
import { VerifactuQR } from "./verifactu-qr"
import { VerifactuQRDemo } from "./verifactu-qr-demo"

export function InvoicePreview({ invoice, customer, company, items }) {
  const printRef = useRef()

  const handlePrint = () => {
    const printContent = printRef.current
    const originalContent = document.body.innerHTML
    document.body.innerHTML = printContent.innerHTML
    window.print()
    document.body.innerHTML = originalContent
    window.location.reload()
  }

  const handleDownloadPDF = () => {
    // Aquí implementarías la generación de PDF
    console.log("Generando PDF...")
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  const taxAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price * item.tax_rate) / 100, 0)
  const total = subtotal + taxAmount

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2 print:hidden">
        <Button variant="outline" onClick={handlePrint}>
          <Print className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
        <Button variant="outline" onClick={handleDownloadPDF}>
          <Download className="h-4 w-4 mr-2" />
          Descargar PDF
        </Button>
      </div>

      {/* Vista previa interactiva del QR (solo en pantalla) */}
      <div className="print:hidden mb-6">
        <h3 className="text-lg font-semibold mb-4">Código QR Verifactu (Interactivo)</h3>
        <div className="flex justify-center">
          <VerifactuQRDemo
            nif={company.tax_id}
            numeroSerie={invoice.invoice_number}
            fecha={invoice.issue_date}
            importe={total}
          />
        </div>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardContent ref={printRef} className="p-8 print:p-0">
          {/* Encabezado de la empresa */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-primary mb-2">FACTURA</h1>
                <div className="text-sm text-muted-foreground">
                  <p className="font-semibold text-lg text-foreground">{company.name}</p>
                  <p>{company.address}</p>
                  <p>
                    {company.postal_code} {company.city}
                  </p>
                  <p>NIF: {company.tax_id}</p>
                  <p>Tel: {company.phone}</p>
                  <p>Email: {company.email}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-primary text-primary-foreground px-4 py-2 rounded mb-4">
                  <p className="text-lg font-bold">{invoice.invoice_number}</p>
                </div>
                <div className="text-sm">
                  <p>
                    <strong>Fecha:</strong> {new Date(invoice.issue_date).toLocaleDateString("es-ES")}
                  </p>
                  <p>
                    <strong>Vencimiento:</strong> {new Date(invoice.due_date).toLocaleDateString("es-ES")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Datos del cliente */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 border-b pb-2">FACTURAR A:</h2>
            <div className="bg-muted p-4 rounded">
              <p className="font-semibold">{customer.name}</p>
              <p>{customer.address}</p>
              <p>
                {customer.postal_code} {customer.city}
              </p>
              <p>NIF/CIF: {customer.tax_id}</p>
              {customer.email && <p>Email: {customer.email}</p>}
              {customer.phone && <p>Tel: {customer.phone}</p>}
            </div>
          </div>

          {/* Tabla de productos/servicios */}
          <div className="mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-primary">
                  <th className="text-left py-3 px-2">Descripción</th>
                  <th className="text-center py-3 px-2 w-20">Cant.</th>
                  <th className="text-right py-3 px-2 w-24">Precio</th>
                  <th className="text-center py-3 px-2 w-16">IVA</th>
                  <th className="text-right py-3 px-2 w-24">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-2">{item.description}</td>
                    <td className="text-center py-3 px-2">{item.quantity}</td>
                    <td className="text-right py-3 px-2">€{item.unit_price.toFixed(2)}</td>
                    <td className="text-center py-3 px-2">{item.tax_rate}%</td>
                    <td className="text-right py-3 px-2">
                      €{(item.quantity * item.unit_price * (1 + item.tax_rate / 100)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totales y código QR */}
          <div className="flex justify-between items-end mb-8">
            <div className="flex-1">
              {/* Código QR Verifactu para impresión */}
              <div className="max-w-xs">
                <h3 className="text-sm font-semibold mb-2">Verificación AEAT</h3>
                <VerifactuQR
                  nif={company.tax_id}
                  numeroSerie={invoice.invoice_number}
                  fecha={invoice.issue_date}
                  importe={total}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Escanee el código QR para verificar esta factura en la web de la AEAT
                </p>
              </div>
            </div>

            <div className="w-64">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA:</span>
                  <span>€{taxAmount.toFixed(2)}</span>
                </div>
                <div className="border-t-2 border-primary pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>TOTAL:</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Términos de pago y notas */}
          <div className="space-y-4">
            {invoice.payment_terms && (
              <div>
                <h3 className="font-semibold mb-1">Términos de Pago:</h3>
                <p className="text-sm text-muted-foreground">{invoice.payment_terms}</p>
              </div>
            )}

            {invoice.notes && (
              <div>
                <h3 className="font-semibold mb-1">Notas:</h3>
                <p className="text-sm text-muted-foreground">{invoice.notes}</p>
              </div>
            )}

            <div className="text-xs text-muted-foreground border-t pt-4">
              <p>
                Esta factura cumple con los requisitos del sistema Verifactu de la Agencia Estatal de Administración
                Tributaria (AEAT).
              </p>
              <p className="mt-1">URL de verificación: https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQR</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
