"use client"

import { useState, useCallback } from "react"

interface VerifactuState {
  loading: boolean
  error: string | null
  success: boolean
}

export function useVerifactu() {
  const [state, setState] = useState<VerifactuState>({
    loading: false,
    error: null,
    success: false,
  })

  const resetState = useCallback(() => {
    setState({ loading: false, error: null, success: false })
  }, [])

  // Crear cliente en Verifactu
  const createCustomer = useCallback(async (customerData: any) => {
    setState({ loading: true, error: null, success: false })

    try {
      const response = await fetch("/api/verifactu?action=create-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      })

      const data = await response.json()

      if (data.success) {
        setState({ loading: false, error: null, success: true })
        return data.customer
      } else {
        setState({ loading: false, error: data.error, success: false })
        throw new Error(data.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setState({ loading: false, error: errorMessage, success: false })
      throw error
    }
  }, [])

  // Crear factura en Verifactu
  const createInvoice = useCallback(async (invoiceData: any) => {
    setState({ loading: true, error: null, success: false })

    try {
      const response = await fetch("/api/verifactu?action=create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      })

      const data = await response.json()

      if (data.success) {
        setState({ loading: false, error: null, success: true })
        return data.invoice
      } else {
        setState({ loading: false, error: data.error, success: false })
        throw new Error(data.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setState({ loading: false, error: errorMessage, success: false })
      throw error
    }
  }, [])

  // Enviar factura a Hacienda
  const sendToHacienda = useCallback(async (invoiceId: string) => {
    setState({ loading: true, error: null, success: false })

    try {
      const response = await fetch(`/api/verifactu?action=send-to-hacienda&id=${invoiceId}`, {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        setState({ loading: false, error: null, success: true })
        return data.result
      } else {
        setState({ loading: false, error: data.error, success: false })
        throw new Error(data.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setState({ loading: false, error: errorMessage, success: false })
      throw error
    }
  }, [])

  // Verificar estado en Hacienda
  const checkHaciendaStatus = useCallback(async (invoiceId: string) => {
    setState({ loading: true, error: null, success: false })

    try {
      const response = await fetch(`/api/verifactu?action=check-hacienda-status&id=${invoiceId}`)
      const data = await response.json()

      if (data.success) {
        setState({ loading: false, error: null, success: true })
        return data.status
      } else {
        setState({ loading: false, error: data.error, success: false })
        throw new Error(data.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setState({ loading: false, error: errorMessage, success: false })
      throw error
    }
  }, [])

  // Cancelar factura
  const cancelInvoice = useCallback(async (invoiceId: string, reason: string) => {
    setState({ loading: true, error: null, success: false })

    try {
      const response = await fetch(`/api/verifactu?action=cancel-invoice&id=${invoiceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      })

      const data = await response.json()

      if (data.success) {
        setState({ loading: false, error: null, success: true })
        return data.result
      } else {
        setState({ loading: false, error: data.error, success: false })
        throw new Error(data.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setState({ loading: false, error: errorMessage, success: false })
      throw error
    }
  }, [])

  // Obtener lista de facturas
  const listInvoices = useCallback(
    async (params?: {
      page?: number
      limit?: number
      status?: string
      customer_id?: string
      date_from?: string
      date_to?: string
    }) => {
      setState({ loading: true, error: null, success: false })

      try {
        const queryParams = new URLSearchParams({ action: "list-invoices" })
        if (params?.page) queryParams.append("page", params.page.toString())
        if (params?.limit) queryParams.append("limit", params.limit.toString())
        if (params?.status) queryParams.append("status", params.status)
        if (params?.customer_id) queryParams.append("customer_id", params.customer_id)
        if (params?.date_from) queryParams.append("date_from", params.date_from)
        if (params?.date_to) queryParams.append("date_to", params.date_to)

        const response = await fetch(`/api/verifactu?${queryParams.toString()}`)
        const data = await response.json()

        if (data.success) {
          setState({ loading: false, error: null, success: true })
          return data.invoices
        } else {
          setState({ loading: false, error: data.error, success: false })
          throw new Error(data.error)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido"
        setState({ loading: false, error: errorMessage, success: false })
        throw error
      }
    },
    [],
  )

  // Obtener lista de clientes
  const listCustomers = useCallback(
    async (params?: {
      page?: number
      limit?: number
      search?: string
    }) => {
      setState({ loading: true, error: null, success: false })

      try {
        const queryParams = new URLSearchParams({ action: "list-customers" })
        if (params?.page) queryParams.append("page", params.page.toString())
        if (params?.limit) queryParams.append("limit", params.limit.toString())
        if (params?.search) queryParams.append("search", params.search)

        const response = await fetch(`/api/verifactu?${queryParams.toString()}`)
        const data = await response.json()

        if (data.success) {
          setState({ loading: false, error: null, success: true })
          return data.customers
        } else {
          setState({ loading: false, error: data.error, success: false })
          throw new Error(data.error)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido"
        setState({ loading: false, error: errorMessage, success: false })
        throw error
      }
    },
    [],
  )

  return {
    ...state,
    createCustomer,
    createInvoice,
    sendToHacienda,
    checkHaciendaStatus,
    cancelInvoice,
    listInvoices,
    listCustomers,
    resetState,
  }
}
