import { createClient } from "./supabase/client"

// Función helper para obtener el cliente de Supabase
const getSupabaseClient = () => {
  console.log("[v0] Creando cliente de Supabase...")
  console.log(
    "[v0] NEXT_PUBLIC_SUPABASE_URL:",
    process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Configurado" : "✗ No configurado",
  )
  console.log(
    "[v0] NEXT_PUBLIC_SUPABASE_ANON_KEY:",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Configurado" : "✗ No configurado",
  )
  return createClient()
}

// Interface completa basada en la estructura de Supabase
export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  tax_id: string
  address?: string
  city?: string
  postal_code?: string
  province?: string
  country?: string
  sector: string
  contact_person?: string
  website?: string
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
  verifactu_id?: string
  verifactu_status: "pending" | "synced" | "error" | "simulated"
  verifactu_message?: string
  verifactu_synced_at?: string
  commercial_name?: string
  administrator?: string
  administrator_nif?: string
  commercial_agent?: string
  available_credit?: number
  validated_credit?: number
  social_security_accounts?: string
  is_sme: boolean
  is_new_creation: boolean
  creation_date?: string
  previous_year_transactions: boolean
  phone_2?: string
  documentation_email?: string
  issuers?: string
  has_rlt: boolean
  rlt_name?: string
  rlt_nif?: string
  number_of_centers: number
  centers_location?: string
  activity_description?: string
  advisory_firm?: string
  advisory_contact?: string
  consultant?: string
  collaborator?: string
  telemarketing?: string
  telemarketing_observations?: string
  central_observations?: string
  other_observations?: string
  import_id?: string
  imported_at?: string
  import_source?: string
}

export interface CustomerStats {
  total: number
  thisMonth: number
  lastMonth: number
  growth: number
  byStatus: {
    pending: number
    synced: number
    error: number
    simulated: number
  }
  bySector: Array<{ sector: string; count: number }>
}

export interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: string
}

export interface ImportResult {
  success: number
  errors: string[]
  warnings: string[]
  duplicates: number
  total: number
}

// Clase de servicio principal
export class SupabaseCustomerService {
  static async getAll(): Promise<ServiceResult<Customer[]>> {
    try {
      console.log("[v0] [SupabaseCustomerService] Obteniendo todos los clientes...")

      const supabase = getSupabaseClient()

      console.log("[v0] Cliente de Supabase creado, ejecutando consulta...")
      const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false })

      console.log("[v0] Respuesta de Supabase:")
      console.log("[v0] - Error:", error)
      console.log("[v0] - Data:", data)
      console.log("[v0] - Número de registros:", data?.length || 0)

      if (error) {
        console.error("[v0] [SupabaseCustomerService] Error en consulta:", error)
        return {
          success: false,
          error: `Error obteniendo clientes: ${error.message}`,
        }
      }

      console.log(`[v0] [SupabaseCustomerService] ${data?.length || 0} clientes obtenidos exitosamente`)
      return {
        success: true,
        data: data || [],
      }
    } catch (error) {
      console.error("[v0] [SupabaseCustomerService] Error en getAll:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  static async getById(id: string): Promise<ServiceResult<Customer>> {
    try {
      console.log("[SupabaseCustomerService] Obteniendo cliente por ID:", id)

      const supabase = getSupabaseClient()
      const { data, error } = await supabase.from("customers").select("*").eq("id", id).single()

      if (error) {
        if (error.code === "PGRST116") {
          return {
            success: false,
            error: "Cliente no encontrado",
          }
        }
        console.error("[SupabaseCustomerService] Error:", error)
        return {
          success: false,
          error: `Error obteniendo cliente: ${error.message}`,
        }
      }

      console.log("[SupabaseCustomerService] Cliente obtenido exitosamente")
      return {
        success: true,
        data,
      }
    } catch (error) {
      console.error("[SupabaseCustomerService] Error en getById:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  static async create(
    customerData: Omit<Customer, "id" | "created_at" | "updated_at">,
  ): Promise<ServiceResult<Customer>> {
    try {
      console.log("[SupabaseCustomerService] Creando cliente:", customerData.name)

      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from("customers")
        .insert([
          {
            ...customerData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("[SupabaseCustomerService] Error:", error)
        return {
          success: false,
          error: `Error creando cliente: ${error.message}`,
        }
      }

      console.log("[SupabaseCustomerService] Cliente creado exitosamente:", data.id)
      return {
        success: true,
        data,
      }
    } catch (error) {
      console.error("[SupabaseCustomerService] Error en create:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  static async update(id: string, updates: Partial<Customer>): Promise<ServiceResult<Customer>> {
    try {
      console.log("[SupabaseCustomerService] Actualizando cliente:", id)

      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from("customers")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("[SupabaseCustomerService] Error:", error)
        return {
          success: false,
          error: `Error actualizando cliente: ${error.message}`,
        }
      }

      console.log("[SupabaseCustomerService] Cliente actualizado exitosamente")
      return {
        success: true,
        data,
      }
    } catch (error) {
      console.error("[SupabaseCustomerService] Error en update:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  static async delete(id: string): Promise<ServiceResult<void>> {
    try {
      console.log("[SupabaseCustomerService] Eliminando cliente:", id)

      const supabase = getSupabaseClient()
      const { error } = await supabase.from("customers").delete().eq("id", id)

      if (error) {
        console.error("[SupabaseCustomerService] Error:", error)
        return {
          success: false,
          error: `Error eliminando cliente: ${error.message}`,
        }
      }

      console.log("[SupabaseCustomerService] Cliente eliminado exitosamente")
      return {
        success: true,
      }
    } catch (error) {
      console.error("[SupabaseCustomerService] Error en delete:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Obtener estadísticas
  static async getStats(): Promise<ServiceResult<CustomerStats>> {
    try {
      console.log("[SupabaseCustomerService] Calculando estadísticas...")

      const customersResult = await this.getAll()
      if (!customersResult.success || !customersResult.data) {
        return {
          success: false,
          error: "Error obteniendo clientes para estadísticas",
        }
      }

      const customers = customersResult.data
      const total = customers.length

      // Calcular clientes de este mes
      const thisMonth = new Date()
      thisMonth.setDate(1)
      thisMonth.setHours(0, 0, 0, 0)

      const thisMonthCount = customers.filter((c) => new Date(c.created_at) >= thisMonth).length

      // Calcular clientes del mes pasado
      const lastMonth = new Date(thisMonth)
      lastMonth.setMonth(lastMonth.getMonth() - 1)

      const lastMonthCount = customers.filter((c) => {
        const createdAt = new Date(c.created_at)
        return createdAt >= lastMonth && createdAt < thisMonth
      }).length

      // Calcular crecimiento
      const growth = lastMonthCount > 0 ? ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100 : 0

      // Estadísticas por estado
      const byStatus = {
        pending: customers.filter((c) => c.verifactu_status === "pending").length,
        synced: customers.filter((c) => c.verifactu_status === "synced").length,
        error: customers.filter((c) => c.verifactu_status === "error").length,
        simulated: customers.filter((c) => c.verifactu_status === "simulated").length,
      }

      // Estadísticas por sector
      const sectorCounts: Record<string, number> = {}
      customers.forEach((customer) => {
        if (customer.sector) {
          sectorCounts[customer.sector] = (sectorCounts[customer.sector] || 0) + 1
        }
      })

      const bySector = Object.entries(sectorCounts)
        .map(([sector, count]) => ({ sector, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      const stats: CustomerStats = {
        total,
        thisMonth: thisMonthCount,
        lastMonth: lastMonthCount,
        growth,
        byStatus,
        bySector,
      }

      console.log("[SupabaseCustomerService] Estadísticas calculadas:", stats)
      return {
        success: true,
        data: stats,
      }
    } catch (error) {
      console.error("[SupabaseCustomerService] Error en getStats:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  static async search(query: string): Promise<ServiceResult<Customer[]>> {
    try {
      console.log("[SupabaseCustomerService] Buscando clientes:", query)

      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,tax_id.ilike.%${query}%,phone.ilike.%${query}%`)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[SupabaseCustomerService] Error:", error)
        return {
          success: false,
          error: `Error buscando clientes: ${error.message}`,
        }
      }

      console.log(`[SupabaseCustomerService] ${data?.length || 0} clientes encontrados`)
      return {
        success: true,
        data: data || [],
      }
    } catch (error) {
      console.error("[SupabaseCustomerService] Error en search:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  static async getBySector(sector: string): Promise<ServiceResult<Customer[]>> {
    try {
      console.log("[SupabaseCustomerService] Obteniendo clientes por sector:", sector)

      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("sector", sector)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[SupabaseCustomerService] Error:", error)
        return {
          success: false,
          error: `Error obteniendo clientes por sector: ${error.message}`,
        }
      }

      console.log(`[SupabaseCustomerService] ${data?.length || 0} clientes en sector ${sector}`)
      return {
        success: true,
        data: data || [],
      }
    } catch (error) {
      console.error("[SupabaseCustomerService] Error en getBySector:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Actualizar estado de Verifactu
  static async updateVerifactuStatus(
    id: string,
    status: "pending" | "synced" | "error" | "simulated",
    verifactuId?: string,
  ): Promise<ServiceResult<Customer>> {
    try {
      console.log("[SupabaseCustomerService] Actualizando estado Verifactu:", id, status)

      const updates: Partial<Customer> = {
        verifactu_status: status,
        verifactu_synced_at: new Date().toISOString(),
      }

      if (verifactuId) {
        updates.verifactu_id = verifactuId
      }

      return await this.update(id, updates)
    } catch (error) {
      console.error("[SupabaseCustomerService] Error en updateVerifactuStatus:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Importar clientes desde CSV/Excel
  static async importFromFile(
    fileContent: string,
    fileType: "csv" | "excel",
    mapping: Record<string, string>,
    importSource = "manual",
  ): Promise<ServiceResult<ImportResult>> {
    try {
      console.log("[SupabaseCustomerService] Iniciando importación desde archivo...")

      const lines = fileContent.split("\n").filter((line) => line.trim())
      if (lines.length < 2) {
        return {
          success: false,
          error: "El archivo debe contener al menos una fila de datos además de los encabezados",
        }
      }

      const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
      const dataLines = lines.slice(1)

      let successCount = 0
      let duplicateCount = 0
      const errors: string[] = []
      const warnings: string[] = []

      const importId = `import_${Date.now()}`
      const importedAt = new Date().toISOString()

      for (let i = 0; i < dataLines.length; i++) {
        try {
          const lineNumber = i + 2
          const values = this.parseCSVLine(dataLines[i])

          if (values.length !== headers.length) {
            warnings.push(`Línea ${lineNumber}: Número de columnas no coincide con encabezados`)
            continue
          }

          const customerData = this.mapRowToCustomer(headers, values, mapping, importId, importedAt, importSource)

          // Validar datos obligatorios
          const validation = this.validateCustomerData(customerData)
          if (!validation.isValid) {
            errors.push(`Línea ${lineNumber}: ${validation.errors.join(", ")}`)
            continue
          }

          // Verificar duplicados por email o tax_id
          const existingCustomer = await this.checkDuplicate(customerData.email, customerData.tax_id)
          if (existingCustomer) {
            duplicateCount++
            warnings.push(`Línea ${lineNumber}: Cliente ya existe (${customerData.email || customerData.tax_id})`)
            continue
          }

          // Crear cliente
          const result = await this.create(customerData)
          if (result.success) {
            successCount++
          } else {
            errors.push(`Línea ${lineNumber}: ${result.error}`)
          }
        } catch (error) {
          errors.push(`Línea ${i + 2}: ${error instanceof Error ? error.message : "Error desconocido"}`)
        }
      }

      const importResult: ImportResult = {
        success: successCount,
        errors,
        warnings,
        duplicates: duplicateCount,
        total: dataLines.length,
      }

      console.log("[SupabaseCustomerService] Importación completada:", importResult)
      return {
        success: true,
        data: importResult,
      }
    } catch (error) {
      console.error("[SupabaseCustomerService] Error en importFromFile:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  private static async checkDuplicate(email: string, taxId: string): Promise<boolean> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from("customers")
        .select("id")
        .or(`email.eq.${email},tax_id.eq.${taxId}`)
        .limit(1)

      if (error) {
        console.error("Error checking duplicates:", error)
        return false
      }

      return (data && data.length > 0) || false
    } catch (error) {
      console.error("Error in checkDuplicate:", error)
      return false
    }
  }

  // Parsear línea CSV considerando comillas
  private static parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        result.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }

    result.push(current.trim())
    return result
  }

  // Mapear fila a objeto Customer
  private static mapRowToCustomer(
    headers: string[],
    values: string[],
    mapping: Record<string, string>,
    importId: string,
    importedAt: string,
    importSource: string,
  ): Omit<Customer, "id" | "created_at" | "updated_at"> {
    const customerData: any = {
      // Valores por defecto
      is_active: true,
      verifactu_status: "pending",
      is_sme: false,
      is_new_creation: false,
      previous_year_transactions: false,
      has_rlt: false,
      number_of_centers: 0,
      country: "España",
      import_id: importId,
      imported_at: importedAt,
      import_source: importSource,
    }

    // Mapear valores según el mapping
    headers.forEach((header, index) => {
      const value = values[index]?.replace(/"/g, "").trim()
      const fieldName = mapping[header]

      if (fieldName && value) {
        switch (fieldName) {
          case "available_credit":
          case "validated_credit":
            customerData[fieldName] = Number.parseFloat(value) || 0
            break
          case "number_of_centers":
            customerData[fieldName] = Number.parseInt(value) || 0
            break
          case "is_active":
          case "is_sme":
          case "is_new_creation":
          case "previous_year_transactions":
          case "has_rlt":
            customerData[fieldName] = value.toLowerCase() === "true" || value === "1" || value.toLowerCase() === "sí"
            break
          case "creation_date":
            try {
              customerData[fieldName] = new Date(value).toISOString().split("T")[0]
            } catch {
              customerData[fieldName] = null
            }
            break
          default:
            customerData[fieldName] = value
        }
      }
    })

    return customerData
  }

  // Validar datos del cliente
  private static validateCustomerData(customerData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Campos obligatorios
    if (!customerData.name) errors.push("Nombre es obligatorio")
    if (!customerData.email) errors.push("Email es obligatorio")
    if (!customerData.tax_id) errors.push("NIF/CIF es obligatorio")
    if (!customerData.sector) errors.push("Sector es obligatorio")

    // Validaciones de formato
    if (customerData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
      errors.push("Formato de email inválido")
    }

    if (customerData.tax_id && !this.validateTaxId(customerData.tax_id)) {
      errors.push("Formato de NIF/CIF inválido")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // Validar NIF/CIF/NIE
  private static validateTaxId(taxId: string): boolean {
    if (!taxId) return false

    const cleanId = taxId.toUpperCase().replace(/[^A-Z0-9]/g, "")

    if (cleanId.length !== 9) return false

    // NIF (DNI)
    if (/^[0-9]{8}[A-Z]$/.test(cleanId)) {
      const letters = "TRWAGMYFPDXBNJZSQVHLCKE"
      const number = Number.parseInt(cleanId.substring(0, 8), 10)
      const letter = cleanId.charAt(8)
      return letters.charAt(number % 23) === letter
    }

    // NIE
    if (/^[XYZ][0-9]{7}[A-Z]$/.test(cleanId)) {
      const letters = "TRWAGMYFPDXBNJZSQVHLCKE"
      let number = cleanId.substring(1, 8)

      switch (cleanId.charAt(0)) {
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

      const letter = cleanId.charAt(8)
      return letters.charAt(Number.parseInt(number, 10) % 23) === letter
    }

    // CIF (simplificado)
    if (/^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/.test(cleanId)) {
      return true // Validación simplificada para CIF
    }

    return false
  }

  // Exportar plantilla CSV
  static async getImportTemplate(): Promise<ServiceResult<string>> {
    try {
      const headers = [
        "name",
        "email",
        "phone",
        "tax_id",
        "address",
        "city",
        "postal_code",
        "province",
        "sector",
        "contact_person",
        "website",
        "commercial_name",
        "administrator",
        "administrator_nif",
        "available_credit",
        "notes",
      ]

      const sampleData = [
        "Empresa Ejemplo S.L.",
        "contacto@ejemplo.com",
        "912345678",
        "B12345678",
        "Calle Ejemplo 123",
        "Madrid",
        "28001",
        "Madrid",
        "Tecnología",
        "Juan Pérez",
        "https://ejemplo.com",
        "Ejemplo Tech",
        "María García",
        "12345678A",
        "50000.00",
        "Cliente de ejemplo para importación",
      ]

      const csvContent = [headers.join(","), sampleData.map((value) => `"${value}"`).join(",")].join("\n")

      return {
        success: true,
        data: csvContent,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error generando plantilla",
      }
    }
  }

  static async bulkUpdateStatus(ids: string[], isActive: boolean): Promise<ServiceResult<void>> {
    try {
      console.log("[SupabaseCustomerService] Actualización masiva de estado para", ids.length, "clientes")

      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from("customers")
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .in("id", ids)

      if (error) {
        console.error("[SupabaseCustomerService] Error:", error)
        return {
          success: false,
          error: `Error en actualización masiva: ${error.message}`,
        }
      }

      console.log("[SupabaseCustomerService] Actualización masiva completada")
      return {
        success: true,
      }
    } catch (error) {
      console.error("[SupabaseCustomerService] Error en bulkUpdateStatus:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Exportar a CSV
  static async exportToCSV(): Promise<ServiceResult<string>> {
    try {
      console.log("[SupabaseCustomerService] Exportando clientes a CSV...")

      const customersResult = await this.getAll()
      if (!customersResult.success || !customersResult.data) {
        return {
          success: false,
          error: "Error obteniendo clientes para exportar",
        }
      }

      const customers = customersResult.data

      const headers = [
        "ID",
        "Nombre",
        "Email",
        "Teléfono",
        "NIF/CIF",
        "Dirección",
        "Ciudad",
        "Código Postal",
        "Provincia",
        "País",
        "Sector",
        "Estado Verifactu",
        "Fecha Creación",
      ]

      const csvContent = [
        headers.join(","),
        ...customers.map((customer) =>
          [
            customer.id,
            `"${customer.name}"`,
            customer.email,
            customer.phone || "",
            customer.tax_id,
            `"${customer.address || ""}"`,
            customer.city || "",
            customer.postal_code || "",
            customer.province || "",
            customer.country || "",
            customer.sector || "",
            customer.verifactu_status,
            new Date(customer.created_at).toLocaleDateString("es-ES"),
          ].join(","),
        ),
      ].join("\n")

      console.log("[SupabaseCustomerService] Exportación CSV completada")
      return {
        success: true,
        data: csvContent,
      }
    } catch (error) {
      console.error("[SupabaseCustomerService] Error en exportToCSV:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }
}

// Exportaciones para compatibilidad
export default SupabaseCustomerService
export const CustomerService = SupabaseCustomerService
