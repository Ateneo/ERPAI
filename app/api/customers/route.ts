import { type NextRequest, NextResponse } from "next/server"
import { CustomerService } from "@/lib/supabase-customers"
import { VerifactuCustomerController } from "@/lib/verifactu-api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    // Si se proporciona un ID, obtener un cliente específico
    if (id) {
      const customer = await CustomerService.getCustomer(id)
      return NextResponse.json({
        success: true,
        customer,
      })
    }

    // Obtener lista de clientes con filtros
    const options = {
      search: searchParams.get("search") || undefined,
      sector: searchParams.get("sector") || undefined,
      province: searchParams.get("province") || undefined,
      verifactu_status: searchParams.get("verifactu_status") || undefined,
      is_active: searchParams.get("is_active") ? searchParams.get("is_active") === "true" : undefined,
      limit: searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined,
      offset: searchParams.get("offset") ? Number.parseInt(searchParams.get("offset")!) : undefined,
    }

    const result = await CustomerService.getCustomers(options)

    return NextResponse.json({
      success: true,
      customers: result.customers,
      total: result.total,
    })
  } catch (error) {
    console.error("Error in GET /api/customers:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("[API] Recibiendo datos del cliente:", body)

    // Validar campos requeridos
    if (!body.name || !body.email || !body.tax_id || !body.phone) {
      return NextResponse.json(
        {
          success: false,
          error: "Nombre, email, teléfono y NIF/CIF son campos obligatorios",
        },
        { status: 400 },
      )
    }

    console.log("[API] Creando cliente en BD:", body.name)

    // Crear cliente en la base de datos primero
    const customer = await CustomerService.createCustomer({
      name: body.name,
      email: body.email,
      phone: body.phone,
      tax_id: body.tax_id,
      address: body.address,
      city: body.city,
      postal_code: body.postal_code,
      province: body.province,
      country: body.country || "España",
      sector: body.sector,
      contact_person: body.contact_person,
      website: body.website,
      notes: body.notes,
      is_active: true,
      verifactu_status: "pending",
    })

    console.log("[API] Cliente creado en BD con ID:", customer.id)

    // Intentar sincronizar con Verifactu
    let verifactuSync = {
      success: false,
      error: "No se intentó la sincronización",
      status: "pending" as const,
      message: "",
    }

    try {
      console.log("[API] Iniciando sincronización con Verifactu...")

      const verifactuResult = await VerifactuCustomerController.create({
        name: customer.name,
        tax_id: customer.tax_id,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        postal_code: customer.postal_code,
        province: customer.province,
        country: customer.country,
        contact_person: customer.contact_person,
      })

      console.log("[API] Resultado de Verifactu:", verifactuResult)

      if (verifactuResult.success) {
        // Actualizar cliente con información de Verifactu
        const updatedCustomer = await CustomerService.updateCustomer(customer.id, {
          verifactu_id: verifactuResult.verifactu_id,
          verifactu_status: verifactuResult.status,
        })

        console.log("[API] Cliente actualizado con estado Verifactu:", verifactuResult.status)

        verifactuSync = {
          success: true,
          error: null,
          status: verifactuResult.status,
          message: verifactuResult.message || "Sincronizado correctamente",
        }

        return NextResponse.json({
          success: true,
          customer: updatedCustomer,
          verifactu_sync: verifactuSync,
        })
      } else {
        // Marcar como error pero continuar
        await CustomerService.updateCustomer(customer.id, {
          verifactu_status: "error",
        })

        console.warn("[API] Error sincronizando con Verifactu:", verifactuResult.error)

        verifactuSync = {
          success: false,
          error: verifactuResult.error || "Error desconocido",
          status: "error",
          message: "Error en la sincronización con Verifactu",
        }

        return NextResponse.json({
          success: true,
          customer: {
            ...customer,
            verifactu_status: "error",
          },
          verifactu_sync: verifactuSync,
        })
      }
    } catch (verifactuError) {
      console.error("[API] Error en sincronización con Verifactu:", verifactuError)

      // Marcar como error pero continuar
      await CustomerService.updateCustomer(customer.id, {
        verifactu_status: "error",
      })

      verifactuSync = {
        success: false,
        error: "Error de conexión con Verifactu",
        status: "error",
        message: "No se pudo conectar con Verifactu",
      }

      return NextResponse.json({
        success: true,
        customer: {
          ...customer,
          verifactu_status: "error",
        },
        verifactu_sync: verifactuSync,
      })
    }
  } catch (error) {
    console.error("Error in POST /api/customers:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error creando cliente",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID del cliente es requerido",
        },
        { status: 400 },
      )
    }

    console.log("[API] Actualizando cliente:", id, updates)

    // Actualizar cliente en la base de datos
    const customer = await CustomerService.updateCustomer(id, updates)

    // Si el cliente tiene verifactu_id, intentar sincronizar cambios
    if (customer.verifactu_id && (updates.name || updates.email || updates.phone)) {
      try {
        console.log("[API] Sincronizando actualización con Verifactu...")

        const verifactuUpdates = {
          nifCliente: customer.tax_id,
          nombreRazonSocial: customer.name,
          nombreComercial: customer.name,
          direccion: customer.address,
          municipio: customer.city,
          codigoPostal: customer.postal_code,
          provincia: customer.province,
          pais: customer.country === "España" ? "ES" : customer.country,
          telefono: customer.phone,
          email: customer.email,
        }

        const verifactuResult = await VerifactuCustomerController.update(
          Number.parseInt(customer.verifactu_id),
          verifactuUpdates,
        )

        if (!verifactuResult.success) {
          console.warn("Error actualizando en Verifactu:", verifactuResult.error)
          // Marcar como error pero continuar
          await CustomerService.updateCustomer(id, {
            verifactu_status: "error",
          })
        } else {
          console.log("Cliente actualizado en Verifactu exitosamente")
        }
      } catch (verifactuError) {
        console.error("Error sincronizando actualización con Verifactu:", verifactuError)
      }
    }

    return NextResponse.json({
      success: true,
      customer,
    })
  } catch (error) {
    console.error("Error in PUT /api/customers:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error actualizando cliente",
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
          error: "ID del cliente es requerido",
        },
        { status: 400 },
      )
    }

    console.log("[API] Eliminando cliente:", id)

    // Obtener cliente antes de eliminar para verificar Verifactu
    const customer = await CustomerService.getCustomer(id)

    // Eliminar de la base de datos (soft delete)
    await CustomerService.deleteCustomer(id)

    // Si el cliente tiene verifactu_id, intentar eliminar de Verifactu
    if (customer.verifactu_id) {
      try {
        console.log("[API] Eliminando cliente de Verifactu:", customer.verifactu_id)
        await VerifactuCustomerController.delete(Number.parseInt(customer.verifactu_id))
        console.log("Cliente eliminado de Verifactu")
      } catch (verifactuError) {
        console.error("Error eliminando de Verifactu:", verifactuError)
        // No fallar la operación por esto
      }
    }

    return NextResponse.json({
      success: true,
      message: "Cliente eliminado correctamente",
    })
  } catch (error) {
    console.error("Error in DELETE /api/customers:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error eliminando cliente",
      },
      { status: 500 },
    )
  }
}
