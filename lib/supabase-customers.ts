import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

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

export class SupabaseCustomerService {
  static async getAll(): Promise<ServiceResult<Customer[]>> {
    try {
      console.log("[v0] SupabaseCustomerService.getAll() llamado")

      const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false })

      if (error) {
        console.log("[v0] Error en getAll:", error.message)
        return { success: false, error: error.message }
      }

      console.log("[v0] Clientes obtenidos:", data?.length || 0)
      return { success: true, data: data || [] }
    } catch (error) {
      console.log("[v0] Excepción en getAll:", error)
      return { success: false, error: error instanceof Error ? error.message : "Error desconocido" }
    }
  }

  static async getById(id: string): Promise<ServiceResult<Customer>> {
    try {
      const { data, error } = await supabase.from("customers").select("*").eq("id", id).single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Error desconocido" }
    }
  }

  static async create(
    customerData: Omit<Customer, "id" | "created_at" | "updated_at">,
  ): Promise<ServiceResult<Customer>> {
    try {
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
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Error desconocido" }
    }
  }

  static async update(id: string, updates: Partial<Customer>): Promise<ServiceResult<Customer>> {
    try {
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
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Error desconocido" }
    }
  }

  static async delete(id: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase.from("customers").delete().eq("id", id)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Error desconocido" }
    }
  }

  static async getStats(): Promise<ServiceResult<CustomerStats>> {
    try {
      const result = await this.getAll()
      if (!result.success || !result.data) {
        return { success: false, error: "Error obteniendo clientes" }
      }

      const customers = result.data
      const total = customers.length

      const thisMonth = new Date()
      thisMonth.setDate(1)
      thisMonth.setHours(0, 0, 0, 0)

      const thisMonthCount = customers.filter((c) => new Date(c.created_at) >= thisMonth).length

      const lastMonth = new Date(thisMonth)
      lastMonth.setMonth(lastMonth.getMonth() - 1)

      const lastMonthCount = customers.filter((c) => {
        const createdAt = new Date(c.created_at)
        return createdAt >= lastMonth && createdAt < thisMonth
      }).length

      const growth = lastMonthCount > 0 ? ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100 : 0

      const byStatus = {
        pending: customers.filter((c) => c.verifactu_status === "pending" || !c.verifactu_status).length,
        synced: customers.filter((c) => c.verifactu_status === "synced").length,
        error: customers.filter((c) => c.verifactu_status === "error").length,
        simulated: customers.filter((c) => c.verifactu_status === "simulated").length,
      }

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

      return {
        success: true,
        data: { total, thisMonth: thisMonthCount, lastMonth: lastMonthCount, growth, byStatus, bySector },
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Error desconocido" }
    }
  }
}

// Alias para compatibilidad
export const CustomerService = {
  async createCustomer(data: any) {
    const result = await SupabaseCustomerService.create(data)
    if (!result.success) throw new Error(result.error)
    return result.data
  },
  async updateCustomer(id: string, data: any) {
    const result = await SupabaseCustomerService.update(id, data)
    if (!result.success) throw new Error(result.error)
    return result.data
  },
  async deleteCustomer(id: string) {
    const result = await SupabaseCustomerService.delete(id)
    if (!result.success) throw new Error(result.error)
  },
  async getCustomers() {
    const result = await SupabaseCustomerService.getAll()
    if (!result.success) throw new Error(result.error)
    return result.data
  },
  async getCustomerById(id: string) {
    const result = await SupabaseCustomerService.getById(id)
    if (!result.success) throw new Error(result.error)
    return result.data
  },
}

export default SupabaseCustomerService
