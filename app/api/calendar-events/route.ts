import { type NextRequest, NextResponse } from "next/server"

// Simulamos una base de datos en memoria para el entorno v0
const calendarEvents: any[] = [
  {
    id: "1",
    title: "Contrato Servicios IT",
    type: "contract",
    event_date: "2024-12-15",
    client_id: 1,
    client_name: "Academia Superior de Estudios",
    amount: 2500,
    description: "Contrato de servicios tecnológicos generado automáticamente",
    status: "completed",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Factura #INV-2024-0001",
    type: "invoice",
    event_date: "2024-12-18",
    client_id: 2,
    client_name: "Construcciones García SL",
    amount: 1850,
    description: "Factura generada automáticamente desde el sistema",
    status: "sent",
    related_id: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Cliente registrado: Hotel Majestic",
    type: "event",
    event_date: "2024-12-10",
    client_id: 3,
    client_name: "Hotel Majestic",
    description: "Nuevo cliente registrado en el sistema",
    status: "completed",
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Presupuesto Formación",
    type: "quote",
    event_date: "2024-12-20",
    client_id: 4,
    client_name: "Restaurante El Buen Sabor",
    amount: 3200,
    description: "Presupuesto para programa de formación del personal",
    status: "pending",
    created_at: new Date().toISOString(),
  },
  {
    id: "5",
    title: "Reunión con cliente",
    type: "meeting",
    event_date: "2024-12-22",
    event_time: "10:00",
    client_id: 5,
    client_name: "Auditoría Martínez y Asociados",
    description: "Reunión de seguimiento del proyecto",
    status: "scheduled",
    created_at: new Date().toISOString(),
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")
    const year = searchParams.get("year")

    let filteredEvents = [...calendarEvents]

    if (month && year) {
      const targetMonth = `${year}-${month.padStart(2, "0")}`
      filteredEvents = calendarEvents.filter((event) => {
        // Verificar que event_date existe y es una string válida
        if (!event.event_date || typeof event.event_date !== "string") {
          return false
        }
        return event.event_date.startsWith(targetMonth)
      })
    }

    return NextResponse.json({
      success: true,
      events: filteredEvents,
      total: filteredEvents.length,
    })
  } catch (error) {
    console.error("Error fetching calendar events:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error fetching events",
        events: [],
        total: 0,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json()

    // Validar datos requeridos
    if (!eventData.title || !eventData.type || !eventData.event_date) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: title, type, event_date",
        },
        { status: 400 },
      )
    }

    const newEvent = {
      id: Date.now().toString(),
      title: eventData.title,
      type: eventData.type,
      event_date: eventData.event_date,
      event_time: eventData.event_time || null,
      client_id: eventData.client_id || null,
      client_name: eventData.client_name || "Sin cliente",
      amount: eventData.amount ? Number(eventData.amount) : null,
      description: eventData.description || "",
      status: eventData.status || "pending",
      related_id: eventData.related_id || null,
      created_at: new Date().toISOString(),
    }

    calendarEvents.push(newEvent)

    return NextResponse.json({
      success: true,
      event: newEvent,
      message: "Event created successfully",
    })
  } catch (error) {
    console.error("Error creating calendar event:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error creating event",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const eventData = await request.json()
    const { id, ...updateData } = eventData

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Event ID is required",
        },
        { status: 400 },
      )
    }

    const eventIndex = calendarEvents.findIndex((event) => event.id === id)
    if (eventIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "Event not found",
        },
        { status: 404 },
      )
    }

    calendarEvents[eventIndex] = {
      ...calendarEvents[eventIndex],
      ...updateData,
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      event: calendarEvents[eventIndex],
      message: "Event updated successfully",
    })
  } catch (error) {
    console.error("Error updating calendar event:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error updating event",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Event ID is required",
        },
        { status: 400 },
      )
    }

    const eventIndex = calendarEvents.findIndex((event) => event.id === id)
    if (eventIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "Event not found",
        },
        { status: 404 },
      )
    }

    const deletedEvent = calendarEvents.splice(eventIndex, 1)[0]

    return NextResponse.json({
      success: true,
      event: deletedEvent,
      message: "Event deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting calendar event:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error deleting event",
      },
      { status: 500 },
    )
  }
}
