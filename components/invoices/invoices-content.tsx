"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { InvoicesList } from "./invoices-list"
import { CreateInvoiceForm } from "./create-invoice-form"
import { InvoiceDetails } from "./invoice-details"

export function InvoicesContent() {
  const [activeTab, setActiveTab] = useState("list")
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [companyData] = useState({
    name: "Flowers&Saints S.L.",
    address: "Calle Ejemplo 123",
    city: "Madrid",
    postal_code: "28001",
    tax_id: "B12345678",
    phone: "+34 912 345 678",
    email: "info@flowerssaints.com",
  })

  // Simular datos mientras no tengamos Supabase conectado
  useEffect(() => {
    // Datos de ejemplo
    setCustomers([
      { id: "1", name: "Empresa ABC S.L.", email: "contacto@empresaabc.com", tax_id: "B12345678" },
      { id: "2", name: "Juan Pérez García", email: "juan.perez@email.com", tax_id: "12345678Z" },
      { id: "3", name: "Tecnología Avanzada S.A.", email: "info@tecavanzada.com", tax_id: "A87654321" },
    ])

    setProducts([
      { id: "1", name: "Consultoría IT", price: 75.0, tax_rate: 21.0, unit: "hora" },
      { id: "2", name: "Desarrollo Web", price: 85.0, tax_rate: 21.0, unit: "hora" },
      { id: "3", name: "Mantenimiento Software", price: 50.0, tax_rate: 21.0, unit: "hora" },
      { id: "4", name: "Licencia Software", price: 500.0, tax_rate: 21.0, unit: "unidad" },
      { id: "5", name: "Hosting Web", price: 25.0, tax_rate: 21.0, unit: "mes" },
    ])

    setInvoices([
      {
        id: "1",
        invoice_number: "INV-2024-0001",
        customer_id: "1",
        customer_name: "Empresa ABC S.L.",
        issue_date: "2024-01-15",
        due_date: "2024-02-15",
        status: "sent",
        total_amount: 1815.0,
        currency: "EUR",
      },
      {
        id: "2",
        invoice_number: "INV-2024-0002",
        customer_id: "2",
        customer_name: "Juan Pérez García",
        issue_date: "2024-01-20",
        due_date: "2024-02-20",
        status: "paid",
        total_amount: 605.0,
        currency: "EUR",
      },
    ])
  }, [])

  const handleCreateInvoice = () => {
    setActiveTab("create")
    setSelectedInvoice(null)
  }

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice)
    setActiveTab("details")
  }

  const handleInvoiceCreated = (newInvoice) => {
    setInvoices((prev) => [...prev, newInvoice])
    setActiveTab("list")
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Facturas</h2>
        <Button onClick={handleCreateInvoice} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Factura
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Lista de Facturas</TabsTrigger>
          <TabsTrigger value="create">Crear Factura</TabsTrigger>
          <TabsTrigger value="details" disabled={!selectedInvoice}>
            Detalles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <InvoicesList invoices={invoices} onViewInvoice={handleViewInvoice} onCreateInvoice={handleCreateInvoice} />
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <CreateInvoiceForm
            customers={customers}
            products={products}
            onInvoiceCreated={handleInvoiceCreated}
            onCancel={() => setActiveTab("list")}
          />
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {selectedInvoice && (
            <InvoiceDetails
              invoice={selectedInvoice}
              customer={customers.find((c) => c.id === selectedInvoice.customer_id)}
              company={companyData}
              onBack={() => setActiveTab("list")}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
