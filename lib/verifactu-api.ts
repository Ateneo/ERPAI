// Constantes de provincias españolas
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
  "Ceuta",
  "Melilla",
]

export const BUSINESS_SECTORS = [
  "Tecnología",
  "Construcción",
  "Comercio",
  "Servicios",
  "Industria",
  "Agricultura",
  "Turismo",
  "Transporte",
  "Educación",
  "Sanidad",
  "Finanzas",
  "Inmobiliario",
  "Alimentación",
  "Textil",
  "Automoción",
  "Energía",
  "Telecomunicaciones",
  "Consultoría",
  "Marketing",
  "Diseño",
  "Legal",
  "Seguros",
  "Logística",
  "Hostelería",
  "Entretenimiento",
  "Farmacéutica",
  "Química",
  "Metalurgia",
  "Papelería",
  "Plásticos",
  "Maquinaria",
  "Electrónica",
  "Medio Ambiente",
  "Otros",
]

export const LEGAL_FORMS = [
  "Sociedad Limitada (SL)",
  "Sociedad Anónima (SA)",
  "Autónomo",
  "Comunidad de Bienes",
  "Sociedad Civil",
  "Cooperativa",
  "Sociedad Laboral",
  "Fundación",
  "Asociación",
  "Otros",
]

export const PAYMENT_METHODS = [
  "Transferencia bancaria",
  "Domiciliación bancaria",
  "Tarjeta de crédito",
  "Cheque",
  "Efectivo",
  "Pagaré",
  "Confirming",
  "Factoring",
  "Otros",
]

export const TAX_REGIMES = [
  "Régimen General",
  "Régimen Simplificado",
  "Recargo de Equivalencia",
  "Exento",
  "Régimen Especial",
  "REBU",
  "Otros",
]

function validateNIF(nif: string): boolean {
  const nifRegex = /^[0-9]{8}[A-Z]$/
  if (!nifRegex.test(nif)) return false
  const letters = "TRWAGMYFPDXBNJZSQVHLCKE"
  const number = Number.parseInt(nif.substring(0, 8), 10)
  return letters.charAt(number % 23) === nif.charAt(8)
}

function validateNIE(nie: string): boolean {
  const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/
  if (!nieRegex.test(nie)) return false
  const letters = "TRWAGMYFPDXBNJZSQVHLCKE"
  let number = nie.substring(1, 8)
  switch (nie.charAt(0)) {
    case "X":
      number = "0" + number
      break
    case "Y":
      number = "1" + number
      break
    case "Z":
      number = "2" + number
      break
  }
  return letters.charAt(Number.parseInt(number, 10) % 23) === nie.charAt(8)
}

function validateCIF(cif: string): boolean {
  const cifRegex = /^[ABCDEFGHJKLMNPQRSUVW][0-9]{7}[0-9A-J]$/
  if (!cifRegex.test(cif)) return false
  const controlLetters = "JABCDEFGHI"
  const centralDigits = cif.substring(1, 8)
  let sumA = 0,
    sumB = 0
  for (let i = 0; i < 7; i++) {
    const digit = Number.parseInt(centralDigits.charAt(i), 10)
    if (i % 2 === 0) {
      const doubled = digit * 2
      sumB += doubled > 9 ? doubled - 9 : doubled
    } else {
      sumA += digit
    }
  }
  const controlDigit = (10 - ((sumA + sumB) % 10)) % 10
  const control = cif.charAt(8)
  const letterTypes = "KPQRSNW"
  if (letterTypes.includes(cif.charAt(0))) return control === controlLetters.charAt(controlDigit)
  const numberTypes = "ABEH"
  if (numberTypes.includes(cif.charAt(0))) return control === controlDigit.toString()
  return control === controlDigit.toString() || control === controlLetters.charAt(controlDigit)
}

export function validateSpanishTaxId(taxId: string): boolean {
  if (!taxId) return false
  const cleanId = taxId.toUpperCase().replace(/[^A-Z0-9]/g, "")
  if (cleanId.length !== 9) return false
  if (/^[0-9]{8}[A-Z]$/.test(cleanId)) return validateNIF(cleanId)
  if (/^[XYZ][0-9]{7}[A-Z]$/.test(cleanId)) return validateNIE(cleanId)
  if (/^[ABCDEFGHJKLMNPQRSUVW][0-9]{7}[0-9A-J]$/.test(cleanId)) return validateCIF(cleanId)
  return false
}

export function getTaxIdType(taxId: string): "NIF" | "NIE" | "CIF" | "UNKNOWN" {
  if (!taxId) return "UNKNOWN"
  const cleanId = taxId.toUpperCase().replace(/[^A-Z0-9]/g, "")
  if (/^[0-9]{8}[A-Z]$/.test(cleanId)) return "NIF"
  if (/^[XYZ][0-9]{7}[A-Z]$/.test(cleanId)) return "NIE"
  if (/^[ABCDEFGHJKLMNPQRSUVW][0-9]{7}[0-9A-J]$/.test(cleanId)) return "CIF"
  return "UNKNOWN"
}

export interface VerifactuConfig {
  apiUrl: string
  apiKey: string
  companyNif: string
  companyName: string
  isProduction: boolean
}

export function getVerifactuConfiguration(): VerifactuConfig {
  return {
    apiUrl: process.env.URL_KOREFACTU || "",
    apiKey: process.env.API_KOREFACTU || "",
    companyNif: process.env.COMPANY_NIF || "",
    companyName: process.env.COMPANY_NAME || "",
    isProduction: process.env.NODE_ENV === "production",
  }
}

export interface VerifactuCustomer {
  nif: string
  name: string
  address?: string
  city?: string
  postalCode?: string
  province?: string
  country?: string
}

export interface VerifactuInvoice {
  invoiceNumber: string
  invoiceDate: string
  customer: VerifactuCustomer
  totalAmount: number
  taxAmount: number
  taxRate: number
}

export interface VerifactuResponse {
  success: boolean
  verifactuId?: string
  message?: string
  error?: string
  simulated?: boolean
}

export class VerifactuCustomerController {
  private config: VerifactuConfig
  constructor() {
    this.config = getVerifactuConfiguration()
  }

  async syncCustomer(customer: VerifactuCustomer): Promise<VerifactuResponse> {
    if (!this.config.apiKey) {
      return { success: true, verifactuId: `SIM-${Date.now()}`, message: "Modo simulación", simulated: true }
    }
    try {
      const response = await fetch(`${this.config.apiUrl}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.config.apiKey}` },
        body: JSON.stringify(customer),
      })
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)
      const data = await response.json()
      return { success: true, verifactuId: data.id || data.verifactuId, message: "Cliente sincronizado" }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Error desconocido" }
    }
  }

  async getCustomer(nif: string): Promise<VerifactuResponse & { customer?: VerifactuCustomer }> {
    if (!this.config.apiKey) return { success: false, error: "API key no configurada", simulated: true }
    try {
      const response = await fetch(`${this.config.apiUrl}/customers/${nif}`, {
        headers: { Authorization: `Bearer ${this.config.apiKey}` },
      })
      if (!response.ok) {
        if (response.status === 404) return { success: false, error: "Cliente no encontrado" }
        throw new Error(`Error HTTP: ${response.status}`)
      }
      return { success: true, customer: await response.json() }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Error desconocido" }
    }
  }
}

export class VerifactuInvoiceController {
  private config: VerifactuConfig
  constructor() {
    this.config = getVerifactuConfiguration()
  }

  async submitInvoice(invoice: VerifactuInvoice): Promise<VerifactuResponse> {
    if (!this.config.apiKey) {
      return { success: true, verifactuId: `SIM-INV-${Date.now()}`, message: "Modo simulación", simulated: true }
    }
    try {
      const response = await fetch(`${this.config.apiUrl}/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.config.apiKey}` },
        body: JSON.stringify(invoice),
      })
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)
      const data = await response.json()
      return { success: true, verifactuId: data.id || data.verifactuId, message: "Factura enviada" }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Error desconocido" }
    }
  }

  async getInvoiceStatus(invoiceId: string): Promise<VerifactuResponse> {
    if (!this.config.apiKey) return { success: true, message: "Modo simulación", simulated: true }
    try {
      const response = await fetch(`${this.config.apiUrl}/invoices/${invoiceId}`, {
        headers: { Authorization: `Bearer ${this.config.apiKey}` },
      })
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)
      const data = await response.json()
      return { success: true, verifactuId: invoiceId, message: data.status || "Enviada" }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Error desconocido" }
    }
  }
}

export function convertToVerifactuCustomer(customer: {
  tax_id: string
  name: string
  address?: string
  city?: string
  postal_code?: string
  province?: string
  country?: string
}): VerifactuCustomer {
  return {
    nif: customer.tax_id,
    name: customer.name,
    address: customer.address,
    city: customer.city,
    postalCode: customer.postal_code,
    province: customer.province,
    country: customer.country || "España",
  }
}

export function convertToVerifactuInvoice(invoice: {
  invoice_number: string
  invoice_date: string
  customer: {
    tax_id: string
    name: string
    address?: string
    city?: string
    postal_code?: string
    province?: string
    country?: string
  }
  total_amount: number
  tax_amount: number
  tax_rate: number
}): VerifactuInvoice {
  return {
    invoiceNumber: invoice.invoice_number,
    invoiceDate: invoice.invoice_date,
    customer: convertToVerifactuCustomer(invoice.customer),
    totalAmount: invoice.total_amount,
    taxAmount: invoice.tax_amount,
    taxRate: invoice.tax_rate,
  }
}
