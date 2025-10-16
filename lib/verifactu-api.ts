// Korefactu API Integration
// This file handles the integration with Korefactu platform for Verifactu system

// Configuration
export function getVerifactuConfiguration() {
  return {
    apiKey: process.env.API_KOREFACTU || "",
    apiUrl: process.env.URL_KOREFACTU || "https://api.korefactu.com",
    isSimulated: !process.env.API_KOREFACTU,
  }
}

// Spanish Provinces
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
  "Gerona",
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
  "Lérida",
  "Lugo",
  "Madrid",
  "Málaga",
  "Murcia",
  "Navarra",
  "Orense",
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

// Business Sectors
export const BUSINESS_SECTORS = [
  "Agricultura y ganadería",
  "Alimentación y bebidas",
  "Automoción",
  "Comercio al por mayor",
  "Comercio al por menor",
  "Construcción",
  "Consultoría",
  "Educación",
  "Energía",
  "Hostelería y turismo",
  "Industria manufacturera",
  "Inmobiliario",
  "Logística y transporte",
  "Marketing y publicidad",
  "Salud y servicios sociales",
  "Servicios financieros",
  "Servicios profesionales",
  "Tecnología e informática",
  "Telecomunicaciones",
  "Otros",
]

// Validate Spanish Tax ID (NIF/CIF/NIE)
export function validateSpanishTaxId(taxId: string): boolean {
  if (!taxId) return false

  const cleanTaxId = taxId.toUpperCase().replace(/[\s-]/g, "")

  // NIF (DNI) - 8 digits + letter
  const nifRegex = /^[0-9]{8}[A-Z]$/
  if (nifRegex.test(cleanTaxId)) {
    const letters = "TRWAGMYFPDXBNJZSQVHLCKE"
    const number = Number.parseInt(cleanTaxId.substring(0, 8))
    const letter = cleanTaxId.charAt(8)
    return letters.charAt(number % 23) === letter
  }

  // NIE - X/Y/Z + 7 digits + letter
  const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/
  if (nieRegex.test(cleanTaxId)) {
    const letters = "TRWAGMYFPDXBNJZSQVHLCKE"
    let number = cleanTaxId.substring(1, 8)
    const prefix = cleanTaxId.charAt(0)
    if (prefix === "X") number = `0${number}`
    else if (prefix === "Y") number = `1${number}`
    else if (prefix === "Z") number = `2${number}`
    const letter = cleanTaxId.charAt(8)
    return letters.charAt(Number.parseInt(number) % 23) === letter
  }

  // CIF - Letter + 7 digits + letter/digit
  const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/
  if (cifRegex.test(cleanTaxId)) {
    const digits = cleanTaxId.substring(1, 8)
    let sum = 0

    // Sum even positions
    for (let i = 1; i < 7; i += 2) {
      sum += Number.parseInt(digits.charAt(i))
    }

    // Sum odd positions (doubled and digits summed)
    for (let i = 0; i < 7; i += 2) {
      const doubled = Number.parseInt(digits.charAt(i)) * 2
      sum += Math.floor(doubled / 10) + (doubled % 10)
    }

    const control = (10 - (sum % 10)) % 10
    const lastChar = cleanTaxId.charAt(8)

    // Check if last character is digit or letter
    if (/[0-9]/.test(lastChar)) {
      return control === Number.parseInt(lastChar)
    }
    const controlLetters = "JABCDEFGHI"
    return controlLetters.charAt(control) === lastChar
  }

  return false
}

// Types
export interface VerifactuCustomer {
  id?: string
  tax_id: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  province?: string
  postal_code?: string
  country?: string
  business_sector?: string
}

export interface VerifactuInvoice {
  id?: string
  customer_id: string
  invoice_number: string
  issue_date: string
  due_date?: string
  subtotal: number
  tax_amount: number
  total: number
  status: string
  items: VerifactuInvoiceItem[]
}

export interface VerifactuInvoiceItem {
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
  total: number
}

// Convert functions
export function convertToVerifactuCustomer(data: any): VerifactuCustomer {
  return {
    id: data.id,
    tax_id: data.tax_id || data.taxId || "",
    name: data.name || "",
    email: data.email,
    phone: data.phone,
    address: data.address,
    city: data.city,
    province: data.province,
    postal_code: data.postal_code || data.postalCode,
    country: data.country || "España",
    business_sector: data.business_sector || data.businessSector,
  }
}

export function convertToVerifactuInvoice(data: any): VerifactuInvoice {
  return {
    id: data.id,
    customer_id: data.customer_id || data.customerId,
    invoice_number: data.invoice_number || data.invoiceNumber,
    issue_date: data.issue_date || data.issueDate,
    due_date: data.due_date || data.dueDate,
    subtotal: data.subtotal || 0,
    tax_amount: data.tax_amount || data.taxAmount || 0,
    total: data.total || 0,
    status: data.status || "draft",
    items: data.items || [],
  }
}

// Customer Controller
export class VerifactuCustomerController {
  private config = getVerifactuConfiguration()

  static async testConnection() {
    const config = getVerifactuConfiguration()

    if (config.isSimulated) {
      return {
        success: true,
        simulated: true,
        message: "Modo simulación activo. Configura API_KOREFACTU para usar la API real.",
        config: {
          apiUrl: config.apiUrl,
          hasApiKey: false,
        },
      }
    }

    try {
      const response = await fetch(`${config.apiUrl}/health`, {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
        },
      })

      if (response.ok) {
        return {
          success: true,
          simulated: false,
          message: "Conexión exitosa con Korefactu",
          config: {
            apiUrl: config.apiUrl,
            hasApiKey: true,
          },
        }
      }

      return {
        success: false,
        error: `Error de conexión: ${response.status}`,
      }
    } catch (error) {
      return {
        success: false,
        error: `Error de red: ${error instanceof Error ? error.message : "Error desconocido"}`,
      }
    }
  }

  async createCustomer(customer: VerifactuCustomer) {
    if (this.config.isSimulated) {
      return {
        success: true,
        simulated: true,
        message: "Cliente creado en modo simulación",
        data: {
          id: `SIM-${Date.now()}`,
          ...customer,
        },
      }
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(customer),
      })

      if (response.ok) {
        const data = await response.json()
        return {
          success: true,
          simulated: false,
          message: "Cliente creado exitosamente",
          data,
        }
      }

      const error = await response.text()
      return {
        success: false,
        error: `Error al crear cliente: ${error}`,
      }
    } catch (error) {
      return {
        success: false,
        error: `Error de red: ${error instanceof Error ? error.message : "Error desconocido"}`,
      }
    }
  }

  async updateCustomer(id: string, customer: Partial<VerifactuCustomer>) {
    if (this.config.isSimulated) {
      return {
        success: true,
        simulated: true,
        message: "Cliente actualizado en modo simulación",
        data: {
          id,
          ...customer,
        },
      }
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/customers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(customer),
      })

      if (response.ok) {
        const data = await response.json()
        return {
          success: true,
          simulated: false,
          message: "Cliente actualizado exitosamente",
          data,
        }
      }

      const error = await response.text()
      return {
        success: false,
        error: `Error al actualizar cliente: ${error}`,
      }
    } catch (error) {
      return {
        success: false,
        error: `Error de red: ${error instanceof Error ? error.message : "Error desconocido"}`,
      }
    }
  }

  static async create(customer: VerifactuCustomer) {
    const controller = new VerifactuCustomerController()
    return controller.createCustomer(customer)
  }

  static async update(id: number, customer: Partial<VerifactuCustomer>) {
    const controller = new VerifactuCustomerController()
    return controller.updateCustomer(id.toString(), customer)
  }

  static async delete(id: number) {
    const controller = new VerifactuCustomerController()
    const config = getVerifactuConfiguration()

    if (config.isSimulated) {
      return {
        success: true,
        simulated: true,
        message: "Cliente eliminado en modo simulación",
      }
    }

    try {
      const response = await fetch(`${config.apiUrl}/customers/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
        },
      })

      if (response.ok) {
        return {
          success: true,
          simulated: false,
          message: "Cliente eliminado exitosamente",
        }
      }

      const error = await response.text()
      return {
        success: false,
        error: `Error al eliminar cliente: ${error}`,
      }
    } catch (error) {
      return {
        success: false,
        error: `Error de red: ${error instanceof Error ? error.message : "Error desconocido"}`,
      }
    }
  }
}

// Invoice Controller
export class VerifactuInvoiceController {
  private config = getVerifactuConfiguration()

  async createInvoice(invoice: VerifactuInvoice) {
    if (this.config.isSimulated) {
      return {
        success: true,
        simulated: true,
        message: "Factura creada en modo simulación",
        data: {
          id: `SIM-INV-${Date.now()}`,
          ...invoice,
        },
      }
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(invoice),
      })

      if (response.ok) {
        const data = await response.json()
        return {
          success: true,
          simulated: false,
          message: "Factura creada exitosamente",
          data,
        }
      }

      const error = await response.text()
      return {
        success: false,
        error: `Error al crear factura: ${error}`,
      }
    } catch (error) {
      return {
        success: false,
        error: `Error de red: ${error instanceof Error ? error.message : "Error desconocido"}`,
      }
    }
  }

  async updateInvoice(id: string, invoice: Partial<VerifactuInvoice>) {
    if (this.config.isSimulated) {
      return {
        success: true,
        simulated: true,
        message: "Factura actualizada en modo simulación",
        data: {
          id,
          ...invoice,
        },
      }
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/invoices/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(invoice),
      })

      if (response.ok) {
        const data = await response.json()
        return {
          success: true,
          simulated: false,
          message: "Factura actualizada exitosamente",
          data,
        }
      }

      const error = await response.text()
      return {
        success: false,
        error: `Error al actualizar factura: ${error}`,
      }
    } catch (error) {
      return {
        success: false,
        error: `Error de red: ${error instanceof Error ? error.message : "Error desconocido"}`,
      }
    }
  }

  async deleteInvoice(id: string) {
    if (this.config.isSimulated) {
      return {
        success: true,
        simulated: true,
        message: "Factura eliminada en modo simulación",
      }
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/invoices/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      })

      if (response.ok) {
        return {
          success: true,
          simulated: false,
          message: "Factura eliminada exitosamente",
        }
      }

      const error = await response.text()
      return {
        success: false,
        error: `Error al eliminar factura: ${error}`,
      }
    } catch (error) {
      return {
        success: false,
        error: `Error de red: ${error instanceof Error ? error.message : "Error desconocido"}`,
      }
    }
  }
}
