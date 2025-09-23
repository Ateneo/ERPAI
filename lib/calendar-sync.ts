// Función para crear evento de calendario cuando se crea una factura
export async function createInvoiceCalendarEvent(invoice: {
  id: string
  invoice_number: string
  customer_name: string
  customer_id?: string
  total_amount: number
  issue_date: string
  status: string
}) {
  try {
    const calendarEvent = {
      title: `Factura #${invoice.invoice_number}`,
      type: "invoice",
      event_date: invoice.issue_date,
      client_name: invoice.customer_name,
      client_id: invoice.customer_id,
      related_id: invoice.id,
      amount: invoice.total_amount,
      description: `Factura emitida para ${invoice.customer_name}`,
      status: invoice.status === "paid" ? "completed" : invoice.status === "sent" ? "sent" : "pending",
    }

    // Llamada a la API para crear el evento
    const response = await fetch("/api/calendar-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(calendarEvent),
    })

    const data = await response.json()

    if (data.success) {
      console.log("✅ Evento de factura creado en calendario:", data.event)
      return data.event
    } else {
      console.error("❌ Error creando evento de factura:", data.error)
    }
  } catch (error) {
    console.error("❌ Error creando evento de factura:", error)
  }
}

// Función para crear evento de calendario cuando se genera un contrato
export async function createContractCalendarEvent(contract: {
  id: string
  customer_id: string
  customer_name: string
  template_name: string
  amount?: number
  created_at?: string
}) {
  try {
    const calendarEvent = {
      title: `Contrato - ${contract.template_name}`,
      type: "contract",
      event_date: contract.created_at ? contract.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
      client_name: contract.customer_name,
      client_id: contract.customer_id,
      related_id: contract.id,
      amount: contract.amount,
      description: `Contrato generado para ${contract.customer_name}`,
      status: "completed",
    }

    // Llamada a la API para crear el evento
    const response = await fetch("/api/calendar-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(calendarEvent),
    })

    const data = await response.json()

    if (data.success) {
      console.log("✅ Evento de contrato creado en calendario:", data.event)
      return data.event
    } else {
      console.error("❌ Error creando evento de contrato:", data.error)
    }
  } catch (error) {
    console.error("❌ Error creando evento de contrato:", error)
  }
}

// Función para crear evento cuando se registra un nuevo cliente
export async function createCustomerCalendarEvent(customer: {
  id: string
  name: string
  sector: string
  created_at?: string
}) {
  try {
    const calendarEvent = {
      title: `Cliente registrado: ${customer.name}`,
      type: "event",
      event_date: customer.created_at ? customer.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
      client_name: customer.name,
      client_id: customer.id,
      description: `Nuevo cliente registrado - ${customer.sector}`,
      status: "completed",
    }

    // Llamada a la API para crear el evento
    const response = await fetch("/api/calendar-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(calendarEvent),
    })

    const data = await response.json()

    if (data.success) {
      console.log("✅ Evento de cliente creado en calendario:", data.event)
      return data.event
    } else {
      console.error("❌ Error creando evento de cliente:", data.error)
    }
  } catch (error) {
    console.error("❌ Error creando evento de cliente:", error)
  }
}

// Función para sincronizar cuando se genera un contrato desde el modal
export async function syncContractGeneration(customer: any, templateName: string) {
  await createContractCalendarEvent({
    id: Date.now().toString(),
    customer_id: customer.id?.toString() || Date.now().toString(),
    customer_name: customer.nombre || customer.name,
    template_name: templateName,
    amount: undefined, // Se puede añadir más tarde
    created_at: new Date().toISOString(),
  })
}
