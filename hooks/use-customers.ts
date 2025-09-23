"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export interface Customer {
  id: string
  name: string
  tax_id: string
  email: string
  phone: string
  address?: string
  city?: string
  postal_code?: string
  province?: string
  country?: string
  sector?: string
  contact_person?: string
  website?: string
  notes?: string
  is_active: boolean
  verifactu_id?: string
  verifactu_status?: string
  verifactu_message?: string
  verifactu_synced_at?: string
  created_at: string
  updated_at: string
}

export interface CustomerStats {
  total: number
  synced: number
  simulated: number
  pending: number
  errors: number
}

interface UseCustomersOptions {
  search?: string
  sector?: string
  province?: string
  verifactu_status?: string
  is_active?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useCustomers(options: UseCustomersOptions = {}) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<CustomerStats>({
    total: 0,
    synced: 0,
    simulated: 0,
    pending: 0,
    errors: 0,
  })

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("[useCustomers] Fetching customers from Supabase...")

      let query = supabase.from("customers").select("*").order("created_at", { ascending: false })

      // Aplicar filtros
      if (options.search) {
        query = query.or(
          `name.ilike.%${options.search}%,email.ilike.%${options.search}%,tax_id.ilike.%${options.search}%`,
        )
      }

      if (options.sector) {
        query = query.eq("sector", options.sector)
      }

      if (options.province) {
        query = query.eq("province", options.province)
      }

      if (options.verifactu_status) {
        query = query.eq("verifactu_status", options.verifactu_status)
      }

      if (options.is_active !== undefined) {
        query = query.eq("is_active", options.is_active)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        console.error("[useCustomers] Error fetching customers:", fetchError)
        throw new Error(`Error obteniendo clientes: ${fetchError.message}`)
      }

      console.log("[useCustomers] Fetched customers:", data?.length || 0)

      const customersData = data || []
      setCustomers(customersData)

      // Calcular estadísticas
      const newStats: CustomerStats = {
        total: customersData.length,
        synced: customersData.filter((c) => c.verifactu_status === "synced").length,
        simulated: customersData.filter((c) => c.verifactu_status === "simulated").length,
        pending: customersData.filter((c) => c.verifactu_status === "pending" || !c.verifactu_status).length,
        errors: customersData.filter((c) => c.verifactu_status === "error").length,
      }

      setStats(newStats)
      console.log("[useCustomers] Stats calculated:", newStats)
    } catch (err) {
      console.error("[useCustomers] Error:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }, [options.search, options.sector, options.province, options.verifactu_status, options.is_active])

  const createCustomer = useCallback(
    async (customerData: Omit<Customer, "id" | "created_at" | "updated_at">) => {
      try {
        console.log("[useCustomers] Creating customer:", customerData.name)

        // Crear cliente en Supabase
        const { data, error: createError } = await supabase
          .from("customers")
          .insert([
            {
              ...customerData,
              verifactu_status: "pending",
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single()

        if (createError) {
          console.error("[useCustomers] Error creating customer:", createError)
          throw new Error(`Error creando cliente: ${createError.message}`)
        }

        console.log("[useCustomers] Customer created:", data.id)

        // Intentar sincronizar con Verifactu automáticamente
        try {
          const syncResponse = await fetch("/api/customers/sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ customerId: data.id }),
          })

          const syncResult = await syncResponse.json()
          console.log("[useCustomers] Auto-sync result:", syncResult)
        } catch (syncError) {
          console.warn("[useCustomers] Auto-sync failed, but customer was created:", syncError)
        }

        // Refrescar la lista
        await fetchCustomers()

        return data
      } catch (err) {
        console.error("[useCustomers] Error creating customer:", err)
        throw err
      }
    },
    [fetchCustomers],
  )

  const refetch = useCallback(() => {
    return fetchCustomers()
  }, [fetchCustomers])

  // Fetch inicial
  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // Auto-refresh
  useEffect(() => {
    if (options.autoRefresh) {
      const interval = setInterval(fetchCustomers, options.refreshInterval || 30000)
      return () => clearInterval(interval)
    }
  }, [options.autoRefresh, options.refreshInterval, fetchCustomers])

  return {
    customers,
    loading,
    error,
    stats,
    refetch,
    createCustomer,
  }
}

// Hook para obtener un cliente individual
export function useCustomer(customerId: string) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomer = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("[useCustomer] Fetching customer from Supabase:", customerId)

      const { data, error: fetchError } = await supabase.from("customers").select("*").eq("id", customerId).single()

      if (fetchError) {
        console.error("[useCustomer] Error fetching customer:", fetchError)
        throw new Error(`Cliente no encontrado: ${fetchError.message}`)
      }

      console.log("[useCustomer] Customer fetched:", data.name)
      setCustomer(data)
    } catch (err) {
      console.error("[useCustomer] Error:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }, [customerId])

  const refetch = useCallback(() => {
    return fetchCustomer()
  }, [fetchCustomer])

  useEffect(() => {
    if (customerId) {
      fetchCustomer()
    }
  }, [customerId, fetchCustomer])

  return {
    customer,
    loading,
    error,
    refetch,
  }
}
