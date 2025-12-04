import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Service {
  id: string
  code: string
  name: string
  description: string | null
  price: number
  category: string | null
  active: boolean
  customer_id: string | null
  customer_name?: string
  created_at: string
  updated_at: string
}

export interface ServiceInput {
  code?: string
  name: string
  description?: string
  price: number
  category?: string
  active?: boolean
  customer_id?: string
}

export class SupabaseServiceService {
  static async getAll(): Promise<Service[]> {
    const { data, error } = await supabase
      .from("services")
      .select(`
        *,
        customers:customer_id (name)
      `)
      .order("code", { ascending: true })

    if (error) {
      console.error("[v0] Error obteniendo servicios:", error)
      return []
    }

    return (data || []).map((service: any) => ({
      ...service,
      customer_name: service.customers?.name || null,
    }))
  }

  static async getById(id: string): Promise<Service | null> {
    const { data, error } = await supabase
      .from("services")
      .select(`
        *,
        customers:customer_id (name)
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("[v0] Error obteniendo servicio:", error)
      return null
    }

    return {
      ...data,
      customer_name: data.customers?.name || null,
    }
  }

  static async create(input: ServiceInput): Promise<Service | null> {
    let code = input.code
    if (!code) {
      const { data: codeData } = await supabase.rpc("generate_service_code")
      code = codeData || `S${Date.now().toString().slice(-4)}`
    }

    const { data, error } = await supabase
      .from("services")
      .insert([{ ...input, code }])
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creando servicio:", error)
      return null
    }

    return data
  }

  static async update(id: string, input: Partial<ServiceInput>): Promise<Service | null> {
    const { data, error } = await supabase.from("services").update(input).eq("id", id).select().single()

    if (error) {
      console.error("[v0] Error actualizando servicio:", error)
      return null
    }

    return data
  }

  static async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("services").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error eliminando servicio:", error)
      return false
    }

    return true
  }

  static async search(query: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from("services")
      .select(`
        *,
        customers:customer_id (name)
      `)
      .or(`code.ilike.%${query}%,name.ilike.%${query}%`)
      .order("code", { ascending: true })
      .limit(50)

    if (error) {
      console.error("[v0] Error buscando servicios:", error)
      return []
    }

    return (data || []).map((service: any) => ({
      ...service,
      customer_name: service.customers?.name || null,
    }))
  }

  static async getByCustomer(customerId: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("customer_id", customerId)
      .order("code", { ascending: true })

    if (error) {
      console.error("[v0] Error obteniendo servicios del cliente:", error)
      return []
    }

    return data || []
  }

  static async generateCode(): Promise<string> {
    const { data } = await supabase.rpc("generate_service_code")
    return data || `S${Date.now().toString().slice(-4)}`
  }

  static async getTotal(): Promise<number> {
    const { data, error } = await supabase.from("services").select("price").eq("active", true)

    if (error) return 0

    return (data || []).reduce((sum, s) => sum + (Number.parseFloat(s.price) || 0), 0)
  }
}

export const ServiceService = SupabaseServiceService
export default SupabaseServiceService
