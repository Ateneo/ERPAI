import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface ServiceLine {
  id?: string
  customer_service_id?: string
  service_id?: string
  service_code: string
  service_name: string
  precio_unitario: number
  unidades: number
  total: number
  orden?: number
}

export interface ServiceComplement {
  id?: string
  customer_service_id?: string
  complemento: string
  precio: number
  observaciones?: string
  orden?: number
}

export interface CustomerService {
  id?: string
  customer_id: string
  numero_presupuesto?: string
  fecha_venta: string
  fecha_facturar?: string
  tipo_vencimiento: string
  fecha_vencimiento?: string
  comercial?: string
  colaborador?: string
  telemarketing?: string
  tipo_contrato: string
  tiempo_contrato: string
  importe_total?: number
  observaciones_factura?: string
  estado: string
  created_at?: string
  updated_at?: string
  // Relaciones
  lines?: ServiceLine[]
  complements?: ServiceComplement[]
  customer?: any
}

export class CustomerServicesService {
  // Obtener todas las preventas de un cliente
  static async getByCustomerId(customerId: string): Promise<CustomerService[]> {
    const { data, error } = await supabase
      .from("customer_services")
      .select(`
        *,
        lines:customer_service_lines(*),
        complements:customer_service_complements(*)
      `)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching customer services:", error)
      return []
    }

    return data || []
  }

  // Obtener una preventa por ID
  static async getById(id: string): Promise<CustomerService | null> {
    const { data, error } = await supabase
      .from("customer_services")
      .select(`
        *,
        lines:customer_service_lines(*),
        complements:customer_service_complements(*),
        customer:customers(id, name, email, tax_id)
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching customer service:", error)
      return null
    }

    return data
  }

  // Crear una nueva preventa
  static async create(
    preventa: Omit<CustomerService, "id" | "created_at" | "updated_at">,
  ): Promise<CustomerService | null> {
    const { lines, complements, customer, ...preventaData } = preventa

    // Crear la preventa principal
    const { data, error } = await supabase.from("customer_services").insert(preventaData).select().single()

    if (error) {
      console.error("Error creating customer service:", error)
      return null
    }

    // Insertar líneas de servicio
    if (lines && lines.length > 0) {
      const linesWithId = lines.map((line, index) => ({
        ...line,
        customer_service_id: data.id,
        orden: index,
      }))

      const { error: linesError } = await supabase.from("customer_service_lines").insert(linesWithId)

      if (linesError) {
        console.error("Error creating service lines:", linesError)
      }
    }

    // Insertar complementos
    if (complements && complements.length > 0) {
      const complementsWithId = complements.map((comp, index) => ({
        ...comp,
        customer_service_id: data.id,
        orden: index,
      }))

      const { error: compError } = await supabase.from("customer_service_complements").insert(complementsWithId)

      if (compError) {
        console.error("Error creating complements:", compError)
      }
    }

    // Retornar la preventa completa
    return this.getById(data.id)
  }

  // Actualizar una preventa
  static async update(id: string, preventa: Partial<CustomerService>): Promise<CustomerService | null> {
    const { lines, complements, customer, ...preventaData } = preventa

    // Actualizar datos principales
    const { error } = await supabase
      .from("customer_services")
      .update({ ...preventaData, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) {
      console.error("Error updating customer service:", error)
      return null
    }

    // Actualizar líneas si se proporcionan
    if (lines !== undefined) {
      // Eliminar líneas existentes
      await supabase.from("customer_service_lines").delete().eq("customer_service_id", id)

      // Insertar nuevas líneas
      if (lines.length > 0) {
        const linesWithId = lines.map((line, index) => ({
          ...line,
          customer_service_id: id,
          orden: index,
        }))

        await supabase.from("customer_service_lines").insert(linesWithId)
      }
    }

    // Actualizar complementos si se proporcionan
    if (complements !== undefined) {
      // Eliminar complementos existentes
      await supabase.from("customer_service_complements").delete().eq("customer_service_id", id)

      // Insertar nuevos complementos
      if (complements.length > 0) {
        const complementsWithId = complements.map((comp, index) => ({
          ...comp,
          customer_service_id: id,
          orden: index,
        }))

        await supabase.from("customer_service_complements").insert(complementsWithId)
      }
    }

    return this.getById(id)
  }

  // Eliminar una preventa
  static async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("customer_services").delete().eq("id", id)

    if (error) {
      console.error("Error deleting customer service:", error)
      return false
    }

    return true
  }

  // Cambiar estado de la preventa
  static async updateStatus(id: string, estado: string): Promise<boolean> {
    const { error } = await supabase
      .from("customer_services")
      .update({ estado, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) {
      console.error("Error updating status:", error)
      return false
    }

    return true
  }

  // Obtener todas las preventas (para listado general)
  static async getAll(): Promise<CustomerService[]> {
    const { data, error } = await supabase
      .from("customer_services")
      .select(`
        *,
        customer:customers(id, name, email, tax_id)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching all customer services:", error)
      return []
    }

    return data || []
  }

  // Obtener estadísticas
  static async getStats(customerId?: string) {
    let query = supabase.from("customer_services").select("estado, importe_total")

    if (customerId) {
      query = query.eq("customer_id", customerId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching stats:", error)
      return { total: 0, aprobadas: 0, pendientes: 0, importe: 0 }
    }

    const stats = {
      total: data?.length || 0,
      aprobadas: data?.filter((d) => d.estado === "aprobada").length || 0,
      pendientes: data?.filter((d) => d.estado === "pendiente").length || 0,
      facturadas: data?.filter((d) => d.estado === "facturada").length || 0,
      importe: data?.reduce((sum, d) => sum + (d.importe_total || 0), 0) || 0,
    }

    return stats
  }
}

export default CustomerServicesService
