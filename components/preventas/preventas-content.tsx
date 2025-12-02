"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { PreventasList } from "./preventas-list"
import { CreatePreventaForm } from "./create-preventa-form"
import { preventaService, type Preventa, type PreventaInput, type PreventaStats } from "@/lib/supabase-preventas"

type View = "list" | "create" | "edit" | "view"

export function PreventasContent() {
  const router = useRouter()
  const [view, setView] = useState<View>("list")
  const [preventas, setPreventas] = useState<Preventa[]>([])
  const [stats, setStats] = useState<PreventaStats>({
    total: 0,
    thisMonth: 0,
    byStatus: { borrador: 0, pendiente: 0, aprobado: 0, facturado: 0, cancelado: 0 },
    totalImporte: 0,
  })
  const [selectedPreventa, setSelectedPreventa] = useState<Preventa | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [preventasData, statsData] = await Promise.all([preventaService.getAll(), preventaService.getStats()])
      setPreventas(preventasData)
      setStats(statsData)
    } catch (error) {
      console.error("Error loading preventas:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreatePreventa = async (data: PreventaInput) => {
    const result = await preventaService.create(data)
    if (result) {
      await loadData()
      setView("list")
    }
  }

  const handleUpdatePreventa = async (data: PreventaInput) => {
    if (!selectedPreventa) return
    const result = await preventaService.update(selectedPreventa.id, data)
    if (result) {
      await loadData()
      setView("list")
      setSelectedPreventa(null)
    }
  }

  const handleDeletePreventa = async (preventa: Preventa) => {
    if (confirm(`¿Estás seguro de que quieres eliminar la preventa ${preventa.numero_presupuesto}?`)) {
      const success = await preventaService.delete(preventa.id)
      if (success) {
        await loadData()
      }
    }
  }

  const handleViewPreventa = (preventa: Preventa) => {
    setSelectedPreventa(preventa)
    setView("view")
  }

  const handleEditPreventa = (preventa: Preventa) => {
    setSelectedPreventa(preventa)
    setView("edit")
  }

  const handleImport = () => {
    router.push("/import/preventas")
  }

  if (view === "create") {
    return <CreatePreventaForm onSubmit={handleCreatePreventa} onCancel={() => setView("list")} />
  }

  if (view === "edit" && selectedPreventa) {
    return (
      <CreatePreventaForm
        onSubmit={handleUpdatePreventa}
        onCancel={() => {
          setView("list")
          setSelectedPreventa(null)
        }}
        initialData={selectedPreventa}
        isEditing
      />
    )
  }

  if (view === "view" && selectedPreventa) {
    return (
      <CreatePreventaForm
        onSubmit={async () => {}}
        onCancel={() => {
          setView("list")
          setSelectedPreventa(null)
        }}
        initialData={selectedPreventa}
        isEditing
      />
    )
  }

  return (
    <PreventasList
      preventas={preventas}
      stats={stats}
      onCreatePreventa={() => setView("create")}
      onViewPreventa={handleViewPreventa}
      onEditPreventa={handleEditPreventa}
      onDeletePreventa={handleDeletePreventa}
      onImport={handleImport}
      isLoading={isLoading}
    />
  )
}
