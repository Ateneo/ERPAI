import { type NextRequest, NextResponse } from "next/server"
import {
  VerifactuCustomerController,
  VerifactuInvoiceController,
  convertToVerifactuCustomer,
  convertToVerifactuInvoice,
  validateSpanishTaxId,
} from "@/lib/verifactu-api"

const customerController = new VerifactuCustomerController()
const invoiceController = new VerifactuInvoiceController()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")
  const id = searchParams.get("id")

  try {
    switch (action) {
      case "get-customer":
        if (!id) {
          return NextResponse.json({ success: false, error: "ID de cliente requerido" }, { status: 400 })
        }
        const customer = await customerController.getCustomer(id)
        return NextResponse.json({ success: true, customer })

      case "list-customers":
        const page = Number.parseInt(searchParams.get("page") || "1")
        const limit = Number.parseInt(searchParams.get("limit") || "10")
        const search = searchParams.get("search") || undefined
        const customers = await customerController.listCustomers({ page, limit, search })
        return NextResponse.json({ success: true, customers })

      case "get-invoice":
        if (!id) {
          return NextResponse.json({ success: false, error: "ID de factura requerido" }, { status: 400 })
        }
        const invoice = await invoiceController.getInvoice(id)
        return NextResponse.json({ success: true, invoice })

      case "list-invoices":
        const invoicePage = Number.parseInt(searchParams.get("page") || "1")
        const invoiceLimit = Number.parseInt(searchParams.get("limit") || "10")
        const status = searchParams.get("status") || undefined
        const customerId = searchParams.get("customer_id") || undefined
        const dateFrom = searchParams.get("date_from") || undefined
        const dateTo = searchParams.get("date_to") || undefined

        const invoices = await invoiceController.listInvoices({
          page: invoicePage,
          limit: invoiceLimit,
          status,
          customer_id: customerId,
          date_from: dateFrom,
          date_to: dateTo,
        })
        return NextResponse.json({ success: true, invoices })

      case "check-hacienda-status":
        if (!id) {
          return NextResponse.json({ success: false, error: "ID de factura requerido" }, { status: 400 })
        }
        const haciendaStatus = await invoiceController.checkHaciendaStatus(id)
        return NextResponse.json({ success: true, status: haciendaStatus })

      case "get-invoice-pdf":
        if (!id) {
          return NextResponse.json({ success: false, error: "ID de factura requerido" }, { status: 400 })
        }
        const pdfData = await invoiceController.getInvoicePDF(id)
        return NextResponse.json({ success: true, pdf: pdfData })

      default:
        return NextResponse.json({ success: false, error: "Acción no válida" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error en API Verifactu:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  try {
    const body = await request.json()

    switch (action) {
      case "create-customer":
        // Validar datos del cliente
        if (!body.tax_id || !validateSpanishTaxId(body.tax_id)) {
          return NextResponse.json(
            {
              success: false,
              error: "NIF/CIF no válido",
            },
            { status: 400 },
          )
        }

        if (!body.name || !body.address || !body.city) {
          return NextResponse.json(
            {
              success: false,
              error: "Faltan campos obligatorios: nombre, dirección, ciudad",
            },
            { status: 400 },
          )
        }

        const verifactuCustomer = convertToVerifactuCustomer(body)
        const createdCustomer = await customerController.createCustomer(verifactuCustomer)
        return NextResponse.json({ success: true, customer: createdCustomer })

      case "update-customer":
        const customerId = searchParams.get("id")
        if (!customerId) {
          return NextResponse.json({ success: false, error: "ID de cliente requerido" }, { status: 400 })
        }

        const updatedCustomer = await customerController.updateCustomer(customerId, body)
        return NextResponse.json({ success: true, customer: updatedCustomer })

      case "create-invoice":
        // Validar datos de la factura
        if (!body.invoice_number || !body.customer_id || !body.total_amount) {
          return NextResponse.json(
            {
              success: false,
              error: "Faltan campos obligatorios: número de factura, cliente, importe total",
            },
            { status: 400 },
          )
        }

        if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
          return NextResponse.json(
            {
              success: false,
              error: "La factura debe tener al menos un elemento",
            },
            { status: 400 },
          )
        }

        const verifactuInvoice = convertToVerifactuInvoice(body)
        const createdInvoice = await invoiceController.createInvoice(verifactuInvoice)
        return NextResponse.json({ success: true, invoice: createdInvoice })

      case "send-to-hacienda":
        const invoiceId = searchParams.get("id")
        if (!invoiceId) {
          return NextResponse.json({ success: false, error: "ID de factura requerido" }, { status: 400 })
        }

        const sendResult = await invoiceController.sendToHacienda(invoiceId)
        return NextResponse.json({ success: true, result: sendResult })

      case "cancel-invoice":
        const cancelInvoiceId = searchParams.get("id")
        if (!cancelInvoiceId) {
          return NextResponse.json({ success: false, error: "ID de factura requerido" }, { status: 400 })
        }

        const reason = body.reason || "Cancelación solicitada por el usuario"
        const cancelResult = await invoiceController.cancelInvoice(cancelInvoiceId, reason)
        return NextResponse.json({ success: true, result: cancelResult })

      default:
        return NextResponse.json({ success: false, error: "Acción no válida" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error en API Verifactu POST:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")
  const id = searchParams.get("id")

  try {
    switch (action) {
      case "delete-customer":
        if (!id) {
          return NextResponse.json({ success: false, error: "ID de cliente requerido" }, { status: 400 })
        }

        await customerController.deleteCustomer(id)
        return NextResponse.json({ success: true, message: "Cliente eliminado correctamente" })

      default:
        return NextResponse.json({ success: false, error: "Acción no válida" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error en API Verifactu DELETE:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
