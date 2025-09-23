// Configuración de la API de Verifactu
const VERIFACTU_API_URL = process.env.VERIFACTU_API_URL || "https://api.verifactu.es"
const VERIFACTU_API_KEY = process.env.VERIFACTU_API_KEY

// Interfaces para Verifactu
export interface VerifactuCustomer {
  id?: string
  name: string
  taxId: string
  email: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  province?: string
  country?: string
}

export interface VerifactuInvoice {
  id?: string
  invoiceNumber: string
  customerId: string
  customerName: string
  customerTaxId: string
  date: string
  dueDate?: string
  items: VerifactuInvoiceItem[]
  subtotal: number
  taxAmount: number
  totalAmount: number
  status: string
}

export interface VerifactuInvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  amount: number
}

export interface VerifactuValidationResult {
  isValid: boolean
  taxId: string
  companyName?: string
  address?: string
  status: "active" | "inactive" | "suspended" | "unknown"
  errors?: string[]
  warnings?: string[]
}

export interface VerifactuSyncResult {
  success: boolean
  verifactuId?: string
  message?: string
  error?: string
  simulated?: boolean
  data?: any
  status?: string
}

export interface VerifactuConfiguration {
  apiUrl: string
  apiKey?: string
  environment: "production" | "development" | "test"
  simulationMode: boolean
  simulationReason?: string
}

// Validador de NIF/CIF/NIE español
export class TaxIdValidator {
  static validate(taxId: string): boolean {
    return validateSpanishTaxId(taxId)
  }

  static validateNIF(nif: string): boolean {
    const letters = "TRWAGMYFPDXBNJZSQVHLCKE"
    const cleanNif = nif.toUpperCase().replace(/[^0-9A-Z]/g, "")

    if (!/^[0-9]{8}[A-Z]$/.test(cleanNif)) return false

    const number = Number.parseInt(cleanNif.substring(0, 8), 10)
    const letter = cleanNif.charAt(8)

    return letters.charAt(number % 23) === letter
  }

  static validateNIE(nie: string): boolean {
    const letters = "TRWAGMYFPDXBNJZSQVHLCKE"
    const cleanNie = nie.toUpperCase().replace(/[^0-9A-Z]/g, "")

    if (!/^[XYZ][0-9]{7}[A-Z]$/.test(cleanNie)) return false

    let number = cleanNie.substring(1, 8)

    switch (cleanNie.charAt(0)) {
      case "X":
        number = "0" + number
        break
      case "Y":
        number = "1" + number
        break
      case "Z":
        number = "2" + number
        break
      default:
        return false
    }

    const letter = cleanNie.charAt(8)
    return letters.charAt(Number.parseInt(number, 10) % 23) === letter
  }

  static validateCIF(cif: string): boolean {
    const cleanCif = cif.toUpperCase().replace(/[^0-9A-Z]/g, "")

    if (!/^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/.test(cleanCif)) return false

    const firstLetter = cleanCif.charAt(0)
    const numbers = cleanCif.substring(1, 8)
    const control = cleanCif.charAt(8)

    let sum = 0
    for (let i = 0; i < numbers.length; i++) {
      let digit = Number.parseInt(numbers.charAt(i), 10)
      if (i % 2 === 1) {
        digit *= 2
        if (digit > 9) digit = Math.floor(digit / 10) + (digit % 10)
      }
      sum += digit
    }

    const units = sum % 10
    const controlDigit = units === 0 ? 0 : 10 - units

    // Algunas organizaciones usan letra, otras número
    if (/[NPQRSW]/.test(firstLetter)) {
      const letters = "JABCDEFGHI"
      return control === letters.charAt(controlDigit)
    } else {
      return control === controlDigit.toString() || control === "JABCDEFGHI".charAt(controlDigit)
    }
  }

  static getType(taxId: string): "NIF" | "NIE" | "CIF" | "INVALID" {
    const cleanId = taxId.toUpperCase().replace(/[^0-9A-Z]/g, "")

    if (/^[0-9]{8}[A-Z]$/.test(cleanId)) return "NIF"
    if (/^[XYZ][0-9]{7}[A-Z]$/.test(cleanId)) return "NIE"
    if (/^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/.test(cleanId)) return "CIF"

    return "INVALID"
  }
}

// Función principal de validación
export function validateSpanishTaxId(taxId: string): boolean {
  if (!taxId) return false

  const cleanId = taxId.toUpperCase().replace(/[^A-Z0-9]/g, "")

  if (cleanId.length !== 9) return false

  // NIF (DNI)
  if (/^[0-9]{8}[A-Z]$/.test(cleanId)) {
    return TaxIdValidator.validateNIF(cleanId)
  }

  // NIE
  if (/^[XYZ][0-9]{7}[A-Z]$/.test(cleanId)) {
    return TaxIdValidator.validateNIE(cleanId)
  }

  // CIF
  if (/^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/.test(cleanId)) {
    return TaxIdValidator.validateCIF(cleanId)
  }

  return false
}

// Función para obtener configuración de Verifactu
export function getVerifactuConfiguration(): VerifactuConfiguration {
  const hasApiKey = !!VERIFACTU_API_KEY && VERIFACTU_API_KEY !== "demo"
  const isProduction = process.env.NODE_ENV === "production"

  return {
    apiUrl: VERIFACTU_API_URL,
    apiKey: VERIFACTU_API_KEY,
    environment: isProduction ? "production" : "development",
    simulationMode: !hasApiKey,
    simulationReason: !hasApiKey ? "No API key configured" : undefined,
  }
}

// Funciones de conversión
export function convertToVerifactuCustomer(customer: any): VerifactuCustomer {
  return {
    id: customer.id,
    name: customer.name,
    taxId: customer.tax_id,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    city: customer.city,
    postalCode: customer.postal_code,
    province: customer.province,
    country: customer.country || "España",
  }
}

export function convertToVerifactuInvoice(invoice: any): VerifactuInvoice {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoice_number,
    customerId: invoice.customer_id,
    customerName: invoice.customer_name,
    customerTaxId: invoice.customer_tax_id,
    date: invoice.date,
    dueDate: invoice.due_date,
    items: invoice.items || [],
    subtotal: invoice.subtotal || 0,
    taxAmount: invoice.tax_amount || 0,
    totalAmount: invoice.total_amount || 0,
    status: invoice.status || "draft",
  }
}

// Controlador de clientes de Verifactu
export class VerifactuCustomerController {
  private static isSimulationMode(): boolean {
    const config = getVerifactuConfiguration()
    return config.simulationMode
  }

  // Probar conexión
  static async testConnection(): Promise<VerifactuSyncResult> {
    try {
      console.log("[VerifactuCustomerController] Probando conexión...")

      if (this.isSimulationMode()) {
        console.log("[VerifactuCustomerController] Modo simulación activado")
        return {
          success: true,
          message: "Conexión simulada exitosa",
          simulated: true,
        }
      }

      // Llamada real a la API
      const response = await fetch(`${VERIFACTU_API_URL}/health`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${VERIFACTU_API_KEY}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      return {
        success: true,
        message: "Conexión exitosa con Verifactu",
        simulated: false,
      }
    } catch (error) {
      console.error("[VerifactuCustomerController] Error en conexión:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        simulated: false,
      }
    }
  }

  // Obtener cliente
  static async getCustomer(id: string): Promise<VerifactuCustomer | null> {
    try {
      console.log("[VerifactuCustomerController] Obteniendo cliente:", id)

      if (this.isSimulationMode()) {
        return {
          id,
          name: `Cliente Simulado ${id}`,
          taxId: "12345678A",
          email: `cliente${id}@ejemplo.com`,
          phone: "600123456",
          address: "Calle Ejemplo 123",
          city: "Madrid",
          postalCode: "28001",
          province: "Madrid",
          country: "España",
        }
      }

      const response = await fetch(`${VERIFACTU_API_URL}/customers/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${VERIFACTU_API_KEY}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()
      return data.customer || null
    } catch (error) {
      console.error("[VerifactuCustomerController] Error obteniendo cliente:", error)
      return null
    }
  }

  // Listar clientes
  static async listCustomers(
    options: {
      page?: number
      limit?: number
      search?: string
    } = {},
  ): Promise<{
    customers: VerifactuCustomer[]
    total: number
    page: number
    limit: number
  }> {
    try {
      console.log("[VerifactuCustomerController] Listando clientes:", options)

      if (this.isSimulationMode()) {
        const simulatedCustomers: VerifactuCustomer[] = Array.from({ length: 5 }, (_, i) => ({
          id: `sim-${i + 1}`,
          name: `Cliente Simulado ${i + 1}`,
          taxId: `1234567${i}A`,
          email: `cliente${i + 1}@ejemplo.com`,
          phone: `60012345${i}`,
          address: `Calle Ejemplo ${i + 1}`,
          city: "Madrid",
          postalCode: "28001",
          province: "Madrid",
          country: "España",
        }))

        return {
          customers: simulatedCustomers,
          total: 5,
          page: options.page || 1,
          limit: options.limit || 10,
        }
      }

      const params = new URLSearchParams()
      if (options.page) params.append("page", options.page.toString())
      if (options.limit) params.append("limit", options.limit.toString())
      if (options.search) params.append("search", options.search)

      const response = await fetch(`${VERIFACTU_API_URL}/customers?${params}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${VERIFACTU_API_KEY}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("[VerifactuCustomerController] Error listando clientes:", error)
      return {
        customers: [],
        total: 0,
        page: options.page || 1,
        limit: options.limit || 10,
      }
    }
  }

  // Crear cliente
  static async createCustomer(customer: VerifactuCustomer): Promise<VerifactuSyncResult> {
    try {
      console.log("[VerifactuCustomerController] Creando cliente:", customer.name)

      // Validar NIF/CIF
      if (!validateSpanishTaxId(customer.taxId)) {
        return {
          success: false,
          error: "NIF/CIF/NIE no válido",
        }
      }

      if (this.isSimulationMode()) {
        const verifactuId = `VF-SIM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        return {
          success: true,
          verifactuId,
          message: "Cliente creado exitosamente (simulado)",
          simulated: true,
          status: "synced",
          data: {
            id: verifactuId,
            ...customer,
          },
        }
      }

      const response = await fetch(`${VERIFACTU_API_URL}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${VERIFACTU_API_KEY}`,
        },
        body: JSON.stringify(customer),
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()

      return {
        success: data.success || false,
        verifactuId: data.customer?.id,
        message: data.message || "Cliente creado exitosamente",
        status: "synced",
        data: data.customer,
      }
    } catch (error) {
      console.error("[VerifactuCustomerController] Error creando cliente:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Actualizar cliente
  static async updateCustomer(id: string, updates: Partial<VerifactuCustomer>): Promise<VerifactuSyncResult> {
    try {
      console.log("[VerifactuCustomerController] Actualizando cliente:", id)

      if (this.isSimulationMode()) {
        return {
          success: true,
          verifactuId: id,
          message: "Cliente actualizado exitosamente (simulado)",
          simulated: true,
          status: "synced",
        }
      }

      const response = await fetch(`${VERIFACTU_API_URL}/customers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${VERIFACTU_API_KEY}`,
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()

      return {
        success: data.success || false,
        verifactuId: id,
        message: data.message || "Cliente actualizado exitosamente",
        status: "synced",
        data: data.customer,
      }
    } catch (error) {
      console.error("[VerifactuCustomerController] Error actualizando cliente:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Eliminar cliente
  static async deleteCustomer(id: string): Promise<VerifactuSyncResult> {
    try {
      console.log("[VerifactuCustomerController] Eliminando cliente:", id)

      if (this.isSimulationMode()) {
        return {
          success: true,
          message: "Cliente eliminado exitosamente (simulado)",
          simulated: true,
        }
      }

      const response = await fetch(`${VERIFACTU_API_URL}/customers/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${VERIFACTU_API_KEY}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      return {
        success: true,
        message: "Cliente eliminado exitosamente",
      }
    } catch (error) {
      console.error("[VerifactuCustomerController] Error eliminando cliente:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Métodos adicionales para compatibilidad
  static async create(customer: any): Promise<VerifactuSyncResult> {
    const verifactuCustomer = convertToVerifactuCustomer(customer)
    return this.createCustomer(verifactuCustomer)
  }

  static async update(id: number | string, updates: any): Promise<VerifactuSyncResult> {
    return this.updateCustomer(id.toString(), updates)
  }

  static async delete(id: number | string): Promise<VerifactuSyncResult> {
    return this.deleteCustomer(id.toString())
  }
}

// Controlador de facturas de Verifactu
export class VerifactuInvoiceController {
  private static isSimulationMode(): boolean {
    const config = getVerifactuConfiguration()
    return config.simulationMode
  }

  // Obtener factura
  static async getInvoice(id: string): Promise<VerifactuInvoice | null> {
    try {
      console.log("[VerifactuInvoiceController] Obteniendo factura:", id)

      if (this.isSimulationMode()) {
        return {
          id,
          invoiceNumber: `INV-SIM-${id}`,
          customerId: "customer-1",
          customerName: "Cliente Simulado",
          customerTaxId: "12345678A",
          date: new Date().toISOString().split("T")[0],
          items: [
            {
              description: "Producto simulado",
              quantity: 1,
              unitPrice: 100,
              taxRate: 21,
              amount: 121,
            },
          ],
          subtotal: 100,
          taxAmount: 21,
          totalAmount: 121,
          status: "draft",
        }
      }

      const response = await fetch(`${VERIFACTU_API_URL}/invoices/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${VERIFACTU_API_KEY}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()
      return data.invoice || null
    } catch (error) {
      console.error("[VerifactuInvoiceController] Error obteniendo factura:", error)
      return null
    }
  }

  // Listar facturas
  static async listInvoices(
    options: {
      page?: number
      limit?: number
      status?: string
      customer_id?: string
      date_from?: string
      date_to?: string
    } = {},
  ): Promise<{
    invoices: VerifactuInvoice[]
    total: number
    page: number
    limit: number
  }> {
    try {
      console.log("[VerifactuInvoiceController] Listando facturas:", options)

      if (this.isSimulationMode()) {
        const simulatedInvoices: VerifactuInvoice[] = Array.from({ length: 3 }, (_, i) => ({
          id: `inv-sim-${i + 1}`,
          invoiceNumber: `INV-SIM-${i + 1}`,
          customerId: "customer-1",
          customerName: "Cliente Simulado",
          customerTaxId: "12345678A",
          date: new Date().toISOString().split("T")[0],
          items: [
            {
              description: `Producto simulado ${i + 1}`,
              quantity: 1,
              unitPrice: 100 * (i + 1),
              taxRate: 21,
              amount: 121 * (i + 1),
            },
          ],
          subtotal: 100 * (i + 1),
          taxAmount: 21 * (i + 1),
          totalAmount: 121 * (i + 1),
          status: "draft",
        }))

        return {
          invoices: simulatedInvoices,
          total: 3,
          page: options.page || 1,
          limit: options.limit || 10,
        }
      }

      const params = new URLSearchParams()
      if (options.page) params.append("page", options.page.toString())
      if (options.limit) params.append("limit", options.limit.toString())
      if (options.status) params.append("status", options.status)
      if (options.customer_id) params.append("customer_id", options.customer_id)
      if (options.date_from) params.append("date_from", options.date_from)
      if (options.date_to) params.append("date_to", options.date_to)

      const response = await fetch(`${VERIFACTU_API_URL}/invoices?${params}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${VERIFACTU_API_KEY}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("[VerifactuInvoiceController] Error listando facturas:", error)
      return {
        invoices: [],
        total: 0,
        page: options.page || 1,
        limit: options.limit || 10,
      }
    }
  }

  // Crear factura
  static async createInvoice(invoice: VerifactuInvoice): Promise<VerifactuSyncResult> {
    try {
      console.log("[VerifactuInvoiceController] Creando factura:", invoice.invoiceNumber)

      if (this.isSimulationMode()) {
        const verifactuId = `VF-INV-SIM-${Date.now()}`
        return {
          success: true,
          verifactuId,
          message: "Factura creada exitosamente (simulado)",
          simulated: true,
          status: "synced",
          data: {
            id: verifactuId,
            ...invoice,
          },
        }
      }

      const response = await fetch(`${VERIFACTU_API_URL}/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${VERIFACTU_API_KEY}`,
        },
        body: JSON.stringify(invoice),
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()

      return {
        success: data.success || false,
        verifactuId: data.invoice?.id,
        message: data.message || "Factura creada exitosamente",
        status: "synced",
        data: data.invoice,
      }
    } catch (error) {
      console.error("[VerifactuInvoiceController] Error creando factura:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Enviar a Hacienda
  static async sendToHacienda(id: string): Promise<VerifactuSyncResult> {
    try {
      console.log("[VerifactuInvoiceController] Enviando factura a Hacienda:", id)

      if (this.isSimulationMode()) {
        return {
          success: true,
          message: "Factura enviada a Hacienda exitosamente (simulado)",
          simulated: true,
          status: "sent",
        }
      }

      const response = await fetch(`${VERIFACTU_API_URL}/invoices/${id}/send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${VERIFACTU_API_KEY}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()

      return {
        success: data.success || false,
        message: data.message || "Factura enviada a Hacienda exitosamente",
        status: "sent",
        data: data.result,
      }
    } catch (error) {
      console.error("[VerifactuInvoiceController] Error enviando a Hacienda:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Cancelar factura
  static async cancelInvoice(id: string, reason: string): Promise<VerifactuSyncResult> {
    try {
      console.log("[VerifactuInvoiceController] Cancelando factura:", id)

      if (this.isSimulationMode()) {
        return {
          success: true,
          message: "Factura cancelada exitosamente (simulado)",
          simulated: true,
          status: "cancelled",
        }
      }

      const response = await fetch(`${VERIFACTU_API_URL}/invoices/${id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${VERIFACTU_API_KEY}`,
        },
        body: JSON.stringify({ reason }),
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()

      return {
        success: data.success || false,
        message: data.message || "Factura cancelada exitosamente",
        status: "cancelled",
        data: data.result,
      }
    } catch (error) {
      console.error("[VerifactuInvoiceController] Error cancelando factura:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Verificar estado en Hacienda
  static async checkHaciendaStatus(id: string): Promise<string> {
    try {
      console.log("[VerifactuInvoiceController] Verificando estado en Hacienda:", id)

      if (this.isSimulationMode()) {
        const statuses = ["pending", "sent", "accepted", "rejected"]
        return statuses[Math.floor(Math.random() * statuses.length)]
      }

      const response = await fetch(`${VERIFACTU_API_URL}/invoices/${id}/status`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${VERIFACTU_API_KEY}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()
      return data.status || "unknown"
    } catch (error) {
      console.error("[VerifactuInvoiceController] Error verificando estado:", error)
      return "error"
    }
  }

  // Obtener PDF de factura
  static async getInvoicePDF(id: string): Promise<string | null> {
    try {
      console.log("[VerifactuInvoiceController] Obteniendo PDF de factura:", id)

      if (this.isSimulationMode()) {
        return "data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVGl0bGUgKEZhY3R1cmEgU2ltdWxhZGEpCi9Qcm9kdWNlciAoVmVyaWZhY3R1IFNpbXVsYWRvcikKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDMgMCBSCj4+CmVuZG9iagozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbNCAwIFJdCi9Db3VudCAxCj4+CmVuZG9iago0IDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9QYXJlbnQgMyAwIFIKL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KPj4KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDc0IDAwMDAwIG4gCjAwMDAwMDAxMjEgMDAwMDAgbiAKMDAwMDAwMDE3OCAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDUKL1Jvb3QgMiAwIFIKPj4Kc3RhcnR4cmVmCjI3MwolJUVPRgo="
      }

      const response = await fetch(`${VERIFACTU_API_URL}/invoices/${id}/pdf`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${VERIFACTU_API_KEY}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()
      return data.pdf || null
    } catch (error) {
      console.error("[VerifactuInvoiceController] Error obteniendo PDF:", error)
      return null
    }
  }
}

// API principal de Verifactu
export class VerifactuAPI {
  private static isSimulationMode(): boolean {
    const config = getVerifactuConfiguration()
    return config.simulationMode
  }

  // Validar cliente con Verifactu
  static async validateCustomer(customer: VerifactuCustomer): Promise<VerifactuValidationResult> {
    try {
      console.log("[VerifactuAPI] Validando cliente:", customer.name)

      // Validación local del NIF/CIF
      if (!validateSpanishTaxId(customer.taxId)) {
        return {
          isValid: false,
          taxId: customer.taxId,
          status: "unknown",
          errors: ["Formato de NIF/CIF/NIE inválido"],
        }
      }

      // Modo simulación
      if (this.isSimulationMode()) {
        console.log("[VerifactuAPI] Modo simulación activado")

        // Simular respuesta exitosa en el 90% de los casos
        const isValid = Math.random() > 0.1

        return {
          isValid,
          taxId: customer.taxId,
          companyName: isValid ? customer.name : undefined,
          address: isValid ? customer.address : undefined,
          status: isValid ? "active" : "inactive",
          warnings: isValid ? [] : ["Cliente no encontrado en base de datos de Verifactu (simulado)"],
        }
      }

      // Llamada real a la API
      const response = await fetch(`${VERIFACTU_API_URL}/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${VERIFACTU_API_KEY}`,
        },
        body: JSON.stringify({
          taxId: customer.taxId,
          name: customer.name,
          email: customer.email,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()

      return {
        isValid: data.valid || false,
        taxId: customer.taxId,
        companyName: data.companyName,
        address: data.address,
        status: data.status || "unknown",
        errors: data.errors || [],
        warnings: data.warnings || [],
      }
    } catch (error) {
      console.error("[VerifactuAPI] Error validando cliente:", error)

      return {
        isValid: false,
        taxId: customer.taxId,
        status: "unknown",
        errors: [`Error de conexión: ${error instanceof Error ? error.message : "Error desconocido"}`],
      }
    }
  }

  // Generar código QR para factura
  static async generateQR(invoiceData: any): Promise<{ success: boolean; qrCode?: string; error?: string }> {
    try {
      console.log("[VerifactuAPI] Generando código QR para factura")

      // Modo simulación
      if (this.isSimulationMode()) {
        const qrData = {
          invoice: invoiceData.number || "INV-001",
          amount: invoiceData.amount || 0,
          date: invoiceData.date || new Date().toISOString(),
          customer: invoiceData.customer || "Cliente",
          timestamp: Date.now(),
        }

        const qrCode = `data:image/svg+xml;base64,${btoa(`
          <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="white"/>
            <text x="100" y="100" textAnchor="middle" fontFamily="Arial" fontSize="12">
              QR Simulado
            </text>
            <text x="100" y="120" textAnchor="middle" fontFamily="Arial" fontSize="10">
              ${qrData.invoice}
            </text>
          </svg>
        `)}`

        return {
          success: true,
          qrCode,
        }
      }

      // Llamada real a la API
      const response = await fetch(`${VERIFACTU_API_URL}/qr/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${VERIFACTU_API_KEY}`,
        },
        body: JSON.stringify(invoiceData),
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()

      return {
        success: data.success || false,
        qrCode: data.qrCode,
        error: data.error,
      }
    } catch (error) {
      console.error("[VerifactuAPI] Error generando QR:", error)

      return {
        success: false,
        error: `Error de conexión: ${error instanceof Error ? error.message : "Error desconocido"}`,
      }
    }
  }

  // Convertir datos locales a formato Verifactu
  static convertToVerifactuFormat(customer: any): VerifactuCustomer {
    return convertToVerifactuCustomer(customer)
  }

  // Obtener información de configuración
  static getConfiguration(): {
    isSimulated: boolean
    apiUrl: string
    hasApiKey: boolean
  } {
    const config = getVerifactuConfiguration()
    return {
      isSimulated: config.simulationMode,
      apiUrl: config.apiUrl,
      hasApiKey: !!config.apiKey && config.apiKey !== "demo",
    }
  }
}

// Exportaciones por defecto
export default VerifactuAPI

// Funciones de utilidad adicionales
export function formatTaxId(taxId: string): string {
  const clean = taxId.toUpperCase().replace(/[^A-Z0-9]/g, "")

  if (clean.length === 9) {
    // Formato: 12345678A o A12345678
    if (/^[0-9]{8}[A-Z]$/.test(clean)) {
      return `${clean.substring(0, 8)}-${clean.substring(8)}`
    } else if (/^[A-Z][0-9]{7}[0-9A-J]$/.test(clean)) {
      return `${clean.substring(0, 1)}-${clean.substring(1, 8)}-${clean.substring(8)}`
    }
  }

  return clean
}

export function getTaxIdType(taxId: string): string {
  const type = TaxIdValidator.getType(taxId)

  switch (type) {
    case "NIF":
      return "Número de Identificación Fiscal (DNI)"
    case "NIE":
      return "Número de Identidad de Extranjero"
    case "CIF":
      return "Código de Identificación Fiscal"
    default:
      return "Formato no válido"
  }
}

export function isValidSpanishTaxId(taxId: string): boolean {
  return validateSpanishTaxId(taxId)
}

// Función de validación principal (alias para compatibilidad)
export const validateTaxId = validateSpanishTaxId

// Constantes útiles
export const SPANISH_PROVINCES = [
  "Álava",
  "Albacete",
  "Alicante",
  "Almería",
  "Asturias",
  "Ávila",
  "Badajoz",
  "Barcelona",
  "Burgos",
  "Cáceres",
  "Cádiz",
  "Cantabria",
  "Castellón",
  "Ciudad Real",
  "Córdoba",
  "Cuenca",
  "Girona",
  "Granada",
  "Guadalajara",
  "Guipúzcoa",
  "Huelva",
  "Huesca",
  "Islas Baleares",
  "Jaén",
  "La Coruña",
  "La Rioja",
  "Las Palmas",
  "León",
  "Lleida",
  "Lugo",
  "Madrid",
  "Málaga",
  "Murcia",
  "Navarra",
  "Ourense",
  "Palencia",
  "Pontevedra",
  "Salamanca",
  "Santa Cruz de Tenerife",
  "Segovia",
  "Sevilla",
  "Soria",
  "Tarragona",
  "Teruel",
  "Toledo",
  "Valencia",
  "Valladolid",
  "Vizcaya",
  "Zamora",
  "Zaragoza",
]

export const BUSINESS_SECTORS = [
  "Agricultura y ganadería",
  "Alimentación y bebidas",
  "Automoción",
  "Construcción",
  "Consultoría",
  "Educación",
  "Energía",
  "Farmacéutico",
  "Finanzas y seguros",
  "Hostelería y turismo",
  "Inmobiliario",
  "Logística y transporte",
  "Manufactura",
  "Marketing y publicidad",
  "Medios de comunicación",
  "Retail y comercio",
  "Salud y bienestar",
  "Servicios profesionales",
  "Tecnología",
  "Telecomunicaciones",
  "Textil y moda",
  "Otros",
]
