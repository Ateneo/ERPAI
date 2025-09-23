import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

// Inicializar Resend (Vercel proporciona esta integración)
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { invoice, customer, pdfBuffer, type = "invoice" } = await request.json()

    // Validar datos requeridos
    if (!invoice || !customer) {
      return NextResponse.json({ error: "Faltan datos de factura o cliente" }, { status: 400 })
    }

    // Configurar el asunto y contenido según el tipo
    const isInvoice = type === "invoice"
    const subject = isInvoice
      ? `Factura ${invoice.invoice_number} - Flowers&Saints S.L.`
      : `Presupuesto ${invoice.invoice_number} - Flowers&Saints S.L.`

    const documentType = isInvoice ? "factura" : "presupuesto"
    const documentTypeCapitalized = isInvoice ? "Factura" : "Presupuesto"

    // Crear el contenido HTML del email
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${documentTypeCapitalized} ${invoice.invoice_number}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .company-name { color: #2563eb; font-size: 24px; font-weight: bold; margin: 0; }
          .content { background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
          .invoice-details { background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
          .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .amount { font-size: 18px; font-weight: bold; color: #059669; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="company-name">Flowers&Saints S.L.</h1>
            <p>Calle Ejemplo 123, 28001 Madrid<br>
            NIF: B12345678<br>
            Tel: +34 912 345 678 | Email: info@flowerssaints.com</p>
          </div>
          
          <div class="content">
            <h2>Estimado/a ${customer.contact_person || customer.name},</h2>
            
            <p>Nos complace adjuntar ${isInvoice ? "la factura" : "el presupuesto"} solicitado${isInvoice ? "a" : ""} con los siguientes detalles:</p>
            
            <div class="invoice-details">
              <h3>${documentTypeCapitalized} #${invoice.invoice_number}</h3>
              <p><strong>Cliente:</strong> ${customer.name}</p>
              <p><strong>Fecha de emisión:</strong> ${new Date(invoice.issue_date).toLocaleDateString("es-ES")}</p>
              ${isInvoice ? `<p><strong>Fecha de vencimiento:</strong> ${new Date(invoice.due_date).toLocaleDateString("es-ES")}</p>` : ""}
              <p class="amount"><strong>Importe total:</strong> €${invoice.total_amount.toFixed(2)}</p>
            </div>
            
            ${
              isInvoice
                ? `
              <p>Le recordamos que el plazo de pago es hasta el <strong>${new Date(invoice.due_date).toLocaleDateString("es-ES")}</strong>.</p>
              
              <p>Para cualquier consulta sobre esta factura, no dude en contactarnos:</p>
            `
                : `
              <p>Este presupuesto tiene una validez de 30 días desde la fecha de emisión.</p>
              
              <p>Si desea proceder con el servicio o tiene alguna consulta, no dude en contactarnos:</p>
            `
            }
            
            <ul>
              <li>Email: info@flowerssaints.com</li>
              <li>Teléfono: +34 912 345 678</li>
            </ul>
            
            ${
              !isInvoice
                ? `
              <p>Esperamos tener la oportunidad de trabajar con ustedes.</p>
            `
                : ""
            }
            
            <p>Gracias por confiar en nuestros servicios.</p>
            
            <p>Atentamente,<br>
            <strong>Equipo de Flowers&Saints S.L.</strong></p>
          </div>
          
          <div class="footer">
            <p>Este email ha sido generado automáticamente. Por favor, no responda a este mensaje.</p>
            <p>Si tiene alguna consulta, contacte con nosotros en info@flowerssaints.com</p>
            ${isInvoice ? "<p>Esta factura cumple con los requisitos del sistema Verifactu de la AEAT.</p>" : ""}
          </div>
        </div>
      </body>
      </html>
    `

    // Preparar los attachments
    const attachments = []
    if (pdfBuffer) {
      attachments.push({
        filename: `${documentTypeCapitalized}_${invoice.invoice_number}_${customer.name}.pdf`,
        content: pdfBuffer,
        type: "application/pdf",
      })
    }

    // Enviar el email usando Resend
    const emailData = {
      from: "Flowers&Saints S.L. <facturas@flowerssaints.com>",
      to: [customer.email],
      subject: subject,
      html: htmlContent,
      attachments: attachments,
      headers: {
        "X-Entity-Ref-ID": `${type}-${invoice.invoice_number}`,
      },
    }

    const result = await resend.emails.send(emailData)

    return NextResponse.json({
      success: true,
      message: `${documentTypeCapitalized} enviada correctamente a ${customer.email}`,
      emailId: result.data?.id,
    })
  } catch (error) {
    console.error("Error enviando email:", error)
    return NextResponse.json(
      {
        error: "Error al enviar el email",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
