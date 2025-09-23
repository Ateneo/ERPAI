"use client"

import { useState } from "react"

interface EmailData {
  invoice: any
  customer: any
  pdfBuffer?: string
  type?: "invoice" | "quote"
}

export function useEmailSender() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendEmail = async (data: EmailData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/send-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error al enviar el email")
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    sendEmail,
    isLoading,
    error,
    clearError: () => setError(null),
  }
}
