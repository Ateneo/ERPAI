import { createBrowserClient } from "@supabase/ssr"
import { VerifactuInvoiceController, convertToVerifactuInvoice } from "./verifactu-api"

export interface Invoice {
  id: string
  invoice_number: string
  series: string
  preventa_id?: string
  customer_id: string
  customer_name: string
  customer_tax_id: string
  customer_address?: string
  customer_city?: string
  customer_postal_code?: string
  customer_province?: string
  customer_country?: string
  invoice_date: string
  due_date?: string
  status: "draft" | "pending" | "sent" | "paid" | "cancelled"
  subtotal: number
  tax_rate: number
  tax_amount: number
  total_amount: number
  verifactu_id?: string
  verifactu_status?: "pending" | "submitted" | "accepted" | "rejected"
  verifactu_submitted_at?: string
  verifactu_response?: Record<string, unknown>
  verifactu_qr_code?: string
  notes?: string
  internal_notes?: string
  created_at: string
  updated_at: string
  salesperson_id?: string
  salesperson_name?: string
}

export interface InvoiceLine {
  id: string
  invoice_id: string
  description: string
  code?: string
  quantity: number
  unit_price: number
  discount_percent: number
  tax_rate: number
  tax_amount: number
  subtotal: number
  total: number
  line_order: number
}

export class InvoiceService {
  private supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  private verifactuController = new VerifactuInvoiceController()

  async getAll(): Promise<Invoice[]> {
    const { data, error } = await this.supabase.from("invoices").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  async getById(id: string): Promise<Invoice | null> {
    const { data, error } = await this.supabase.from("invoices").select("*").eq("id", id).single()

    if (error) throw error
    return data
  }

  async getLines(invoiceId: string): Promise<InvoiceLine[]> {
    const { data, error } = await this.supabase
      .from("invoice_lines")
      .select("*")
      .eq("invoice_id", invoiceId)
      .order("line_order", { ascending: true })

    if (error) throw error
    return data || []
  }

  async create(invoice: Partial<Invoice>, lines: Partial<InvoiceLine>[]): Promise<Invoice> {
    // Generar número de factura
    const { data: numData } = await this.supabase.rpc("generate_invoice_number", {
      p_series: invoice.series || "F",
    })

    const invoiceData = {
      ...invoice,
      invoice_number: numData || `F${Date.now()}`,
      status: "draft" as const,
    }

    const { data, error } = await this.supabase.from("invoices").insert(invoiceData).select().single()

    if (error) throw error

    // Insertar líneas
    if (lines.length > 0) {
      const linesWithInvoiceId = lines.map((line, index) => ({
        ...line,
        invoice_id: data.id,
        line_order: index,
      }))

      await this.supabase.from("invoice_lines").insert(linesWithInvoiceId)
    }

    return data
  }

  async createFromPreventa(preventaId: string): Promise<Invoice> {
    // Obtener preventa con servicios
    const { data: preventa, error: preventaError } = await this.supabase
      .from("preventas")
      .select(`
        *,
        preventa_servicios(*),
        preventa_complementos(*)
      `)
      .eq("id", preventaId)
      .single()

    if (preventaError) throw preventaError

    // Obtener datos del cliente
    const { data: customer } = await this.supabase.from("customers").select("*").eq("id", preventa.customer_id).single()

    // Calcular totales
    const subtotal = preventa.total_amount || 0
    const taxRate = 21
    const taxAmount = subtotal * (taxRate / 100)
    const totalAmount = subtotal + taxAmount

    // Crear factura
    const invoice = await this.create(
      {
        preventa_id: preventaId,
        customer_id: preventa.customer_id,
        customer_name: customer?.name || preventa.customer_name,
        customer_tax_id: customer?.tax_id || "",
        customer_address: customer?.address,
        customer_city: customer?.city,
        customer_postal_code: customer?.postal_code,
        customer_province: customer?.province,
        customer_country: customer?.country || "España",
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        notes: preventa.observations,
        salesperson_name: preventa.salesperson_name,
      },
      [],
    )

    // Crear líneas de servicios
    const lines: Partial<InvoiceLine>[] = []

    for (const servicio of preventa.preventa_servicios || []) {
      lines.push({
        description: servicio.service_name,
        code: servicio.service_code,
        quantity: servicio.quantity,
        unit_price: servicio.unit_price,
        tax_rate: 21,
        subtotal: servicio.total,
        total: servicio.total * 1.21,
      })
    }

    for (const complemento of preventa.preventa_complementos || []) {
      lines.push({
        description: complemento.complement_name,
        quantity: 1,
        unit_price: complemento.price,
        tax_rate: 21,
        subtotal: complemento.price,
        total: complemento.price * 1.21,
      })
    }

    if (lines.length > 0) {
      await this.supabase.from("invoice_lines").insert(
        lines.map((line, index) => ({
          ...line,
          invoice_id: invoice.id,
          line_order: index,
        })),
      )
    }

    // Actualizar preventa como facturada
    await this.supabase.from("preventas").update({ status: "invoiced", invoice_id: invoice.id }).eq("id", preventaId)

    return invoice
  }

  async submitToVerifactu(invoiceId: string): Promise<{ success: boolean; message: string }> {
    const invoice = await this.getById(invoiceId)
    if (!invoice) throw new Error("Factura no encontrada")

    // Convertir a formato Verifactu
    const verifactuInvoice = convertToVerifactuInvoice({
      invoice_number: invoice.invoice_number,
      invoice_date: invoice.invoice_date,
      customer: {
        tax_id: invoice.customer_tax_id,
        name: invoice.customer_name,
        address: invoice.customer_address,
        city: invoice.customer_city,
        postal_code: invoice.customer_postal_code,
        province: invoice.customer_province,
        country: invoice.customer_country,
      },
      total_amount: invoice.total_amount,
      tax_amount: invoice.tax_amount,
      tax_rate: invoice.tax_rate,
    })

    // Enviar a Verifactu
    const response = await this.verifactuController.submitInvoice(verifactuInvoice)

    // Actualizar factura con respuesta
    await this.supabase
      .from("invoices")
      .update({
        verifactu_id: response.verifactuId,
        verifactu_status: response.success ? "submitted" : "rejected",
        verifactu_submitted_at: new Date().toISOString(),
        verifactu_response: response,
        status: response.success ? "sent" : "pending",
      })
      .eq("id", invoiceId)

    return {
      success: response.success,
      message: response.message || response.error || "Operación completada",
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("invoices").delete().eq("id", id)
    if (error) throw error
  }
}

export const invoiceService = new InvoiceService()
