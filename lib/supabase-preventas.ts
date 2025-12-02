import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let supabaseInstance: ReturnType<typeof createClient> | null = null

function getSupabase() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

export interface PreventaService {
  id: string
  preventa_id: string
  servicio: string
  precio_unitario: number
  unidades: number
  total: number
  created_at?: string
}

export interface PreventaComplemento {
  id: string
  preventa_id: string
  complemento: string
  precio: number
  observaciones?: string
  created_at?: string
}

export interface Preventa {
  id: string
  numero_presupuesto: string
  cliente_id?: string
  cliente_nombre: string
  colaborador?: string
  telemarketing?: string
  fecha_venta: string
  fecha_facturar?: string
  tipo_vencimiento: string
  fecha_vencimiento?: string
  comercial: string
  tipo_contrato: "cliente" | "colaborador"
  tiempo_contrato: "año" | "año_mantenimiento"
  importe_total: number
  observaciones?: string
  estado: "borrador" | "pendiente" | "aprobado" | "facturado" | "cancelado"
  created_at?: string
  updated_at?: string
  servicios?: PreventaService[]
  complementos?: PreventaComplemento[]
}

export interface PreventaInput {
  numero_presupuesto: string
  cliente_id?: string
  cliente_nombre: string
  colaborador?: string
  telemarketing?: string
  fecha_venta: string
  fecha_facturar?: string
  tipo_vencimiento: string
  fecha_vencimiento?: string
  comercial: string
  tipo_contrato: "cliente" | "colaborador"
  tiempo_contrato: "año" | "año_mantenimiento"
  importe_total: number
  observaciones?: string
  estado?: "borrador" | "pendiente" | "aprobado" | "facturado" | "cancelado"
  servicios?: Omit<PreventaService, "id" | "preventa_id" | "created_at">[]
  complementos?: Omit<PreventaComplemento, "id" | "preventa_id" | "created_at">[]
}

export interface PreventaStats {
  total: number
  thisMonth: number
  byStatus: {
    borrador: number
    pendiente: number
    aprobado: number
    facturado: number
    cancelado: number
  }
  totalImporte: number
}

export class SupabasePreventaService {
  private supabase = getSupabase()

  async getAll(): Promise<Preventa[]> {
    const { data, error } = await this.supabase.from("preventas").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching preventas:", error)
      return []
    }

    return data || []
  }

  async getById(id: string): Promise<Preventa | null> {
    const { data: preventa, error } = await this.supabase.from("preventas").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching preventa:", error)
      return null
    }

    // Get services
    const { data: servicios } = await this.supabase.from("preventa_servicios").select("*").eq("preventa_id", id)

    // Get complements
    const { data: complementos } = await this.supabase.from("preventa_complementos").select("*").eq("preventa_id", id)

    return {
      ...preventa,
      servicios: servicios || [],
      complementos: complementos || [],
    }
  }

  async create(input: PreventaInput): Promise<Preventa | null> {
    const { servicios, complementos, ...preventaData } = input

    const { data: preventa, error } = await this.supabase
      .from("preventas")
      .insert({
        ...preventaData,
        estado: preventaData.estado || "borrador",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating preventa:", error)
      return null
    }

    // Insert services
    if (servicios && servicios.length > 0) {
      const serviciosData = servicios.map((s) => ({
        ...s,
        preventa_id: preventa.id,
      }))
      await this.supabase.from("preventa_servicios").insert(serviciosData)
    }

    // Insert complements
    if (complementos && complementos.length > 0) {
      const complementosData = complementos.map((c) => ({
        ...c,
        preventa_id: preventa.id,
      }))
      await this.supabase.from("preventa_complementos").insert(complementosData)
    }

    return this.getById(preventa.id)
  }

  async update(id: string, input: Partial<PreventaInput>): Promise<Preventa | null> {
    const { servicios, complementos, ...preventaData } = input

    const { error } = await this.supabase
      .from("preventas")
      .update({
        ...preventaData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating preventa:", error)
      return null
    }

    // Update services if provided
    if (servicios !== undefined) {
      await this.supabase.from("preventa_servicios").delete().eq("preventa_id", id)
      if (servicios.length > 0) {
        const serviciosData = servicios.map((s) => ({
          ...s,
          preventa_id: id,
        }))
        await this.supabase.from("preventa_servicios").insert(serviciosData)
      }
    }

    // Update complements if provided
    if (complementos !== undefined) {
      await this.supabase.from("preventa_complementos").delete().eq("preventa_id", id)
      if (complementos.length > 0) {
        const complementosData = complementos.map((c) => ({
          ...c,
          preventa_id: id,
        }))
        await this.supabase.from("preventa_complementos").insert(complementosData)
      }
    }

    return this.getById(id)
  }

  async delete(id: string): Promise<boolean> {
    // Delete related records first
    await this.supabase.from("preventa_servicios").delete().eq("preventa_id", id)
    await this.supabase.from("preventa_complementos").delete().eq("preventa_id", id)

    const { error } = await this.supabase.from("preventas").delete().eq("id", id)

    if (error) {
      console.error("Error deleting preventa:", error)
      return false
    }

    return true
  }

  async getStats(): Promise<PreventaStats> {
    const { data: preventas } = await this.supabase.from("preventas").select("*")

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const stats: PreventaStats = {
      total: preventas?.length || 0,
      thisMonth: preventas?.filter((p) => p.created_at >= startOfMonth).length || 0,
      byStatus: {
        borrador: 0,
        pendiente: 0,
        aprobado: 0,
        facturado: 0,
        cancelado: 0,
      },
      totalImporte: 0,
    }

    preventas?.forEach((p) => {
      if (p.estado in stats.byStatus) {
        stats.byStatus[p.estado as keyof typeof stats.byStatus]++
      }
      stats.totalImporte += p.importe_total || 0
    })

    return stats
  }

  async generateNumeroPresupuesto(): Promise<string> {
    const year = new Date().getFullYear()
    const { count } = await this.supabase
      .from("preventas")
      .select("*", { count: "exact", head: true })
      .gte("created_at", `${year}-01-01`)
      .lt("created_at", `${year + 1}-01-01`)

    const nextNumber = (count || 0) + 1
    return `PRE-${year}-${String(nextNumber).padStart(4, "0")}`
  }

  async importFromCSV(records: Partial<PreventaInput>[]): Promise<{ success: number; errors: number }> {
    let success = 0
    let errors = 0

    for (const record of records) {
      try {
        if (!record.numero_presupuesto) {
          record.numero_presupuesto = await this.generateNumeroPresupuesto()
        }
        const result = await this.create(record as PreventaInput)
        if (result) {
          success++
        } else {
          errors++
        }
      } catch (e) {
        console.error("Error importing record:", e)
        errors++
      }
    }

    return { success, errors }
  }
}

export const preventaService = new SupabasePreventaService()
