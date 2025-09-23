import { type NextRequest, NextResponse } from "next/server"
import { SupabaseCustomerService } from "@/lib/supabase-customers"
import { VerifactuCustomerController } from "@/lib/verifactu-api"

// Sincronizar cliente individual
export async function POST(request: NextRequest) {
  try {
    const { customerId } = await request.json()

    if (!customerId) {
      return NextResponse.json(
        {
          success: false,
          error: "ID de cliente requerido",
        },
        { status: 400 },
      )
    }

    console.log("[API] Sincronizando cliente:", customerId)

    // Obtener cliente de Supabase
    const customerResult = await SupabaseCustomerService.getById(customerId)

    if (!customerResult.success || !customerResult.data) {
      return NextResponse.json(
        {
          success: false,
          error: customerResult.error || "Cliente no encontrado",
        },
        { status: 404 },
      )
    }

    const customer = customerResult.data

    // Sincronizar con Verifactu
    let verifactuResult

    if (customer.verifactu_id && customer.verifactu_id !== "null") {
      // Actualizar cliente existente
      verifactuResult = await VerifactuCustomerController.updateCustomer(customer.verifactu_id, customer)
    } else {
      // Crear nuevo cliente
      verifactuResult = await VerifactuCustomerController.createCustomer(customer)
    }

    // Actualizar estado en Supabase
    const updateData: any = {
      verifactu_synced_at: new Date().toISOString(),
    }

    if (verifactuResult.success) {
      updateData.verifactu_status = verifactuResult.simulated ? "simulated" : "synced"
      updateData.verifactu_message = verifactuResult.message

      if (verifactuResult.data?.id) {
        updateData.verifactu_id = verifactuResult.data.id
      }
    } else {
      updateData.verifactu_status = "error"
      updateData.verifactu_message = verifactuResult.error
    }

    const updateResult = await SupabaseCustomerService.update(customerId, updateData)

    if (!updateResult.success) {
      console.error("[API] Error actualizando estado en Supabase:", updateResult.error)
    }

    console.log("[API] Sincronización completada:", {
      success: verifactuResult.success,
      simulated: verifactuResult.simulated,
      status: updateData.verifactu_status,
    })

    return NextResponse.json({
      success: verifactuResult.success,
      simulated: verifactuResult.simulated,
      message: verifactuResult.message,
      error: verifactuResult.error,
      customer: updateResult.data,
    })
  } catch (error) {
    console.error("[API] Error en sincronización:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

// Sincronizar todos los clientes pendientes
export async function PUT() {
  try {
    console.log("[API] Sincronizando todos los clientes pendientes...")

    // Obtener todos los clientes
    const customersResult = await SupabaseCustomerService.getAll()

    if (!customersResult.success || !customersResult.data) {
      return NextResponse.json(
        {
          success: false,
          error: customersResult.error || "Error obteniendo clientes",
        },
        { status: 500 },
      )
    }

    // Filtrar clientes pendientes
    const pendingCustomers = customersResult.data.filter(
      (customer) => customer.verifactu_status === "pending" || !customer.verifactu_status,
    )

    console.log(`[API] ${pendingCustomers.length} clientes pendientes encontrados`)

    const results = []

    // Sincronizar cada cliente
    for (const customer of pendingCustomers) {
      try {
        console.log(`[API] Sincronizando cliente: ${customer.name}`)

        // Crear en Verifactu
        const verifactuResult = await VerifactuCustomerController.createCustomer(customer)

        // Actualizar estado en Supabase
        const updateData: any = {
          verifactu_synced_at: new Date().toISOString(),
        }

        if (verifactuResult.success) {
          updateData.verifactu_status = verifactuResult.simulated ? "simulated" : "synced"
          updateData.verifactu_message = verifactuResult.message

          if (verifactuResult.data?.id) {
            updateData.verifactu_id = verifactuResult.data.id
          }
        } else {
          updateData.verifactu_status = "error"
          updateData.verifactu_message = verifactuResult.error
        }

        await SupabaseCustomerService.update(customer.id, updateData)

        results.push({
          customerId: customer.id,
          customerName: customer.name,
          success: verifactuResult.success,
          simulated: verifactuResult.simulated,
          message: verifactuResult.message,
          error: verifactuResult.error,
        })
      } catch (error) {
        console.error(`[API] Error sincronizando cliente ${customer.name}:`, error)

        results.push({
          customerId: customer.id,
          customerName: customer.name,
          success: false,
          error: error instanceof Error ? error.message : "Error desconocido",
        })
      }
    }

    const successCount = results.filter((r) => r.success).length
    const errorCount = results.filter((r) => !r.success).length

    console.log(`[API] Sincronización masiva completada: ${successCount} éxitos, ${errorCount} errores`)

    return NextResponse.json({
      success: true,
      message: `Sincronización completada: ${successCount} éxitos, ${errorCount} errores`,
      results,
      summary: {
        total: results.length,
        success: successCount,
        errors: errorCount,
      },
    })
  } catch (error) {
    console.error("[API] Error en sincronización masiva:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
