import { NextResponse } from "next/server"
import { VerifactuCustomerController, getVerifactuConfiguration } from "@/lib/verifactu-api"

export async function GET() {
  try {
    console.log("[API] Probando conexión con Verifactu...")

    // Obtener configuración
    const config = getVerifactuConfiguration()

    // Probar conexión
    const result = await VerifactuCustomerController.testConnection()

    console.log("[API] Resultado de prueba Verifactu:", result)

    return NextResponse.json({
      success: result.success,
      simulated: result.simulated,
      message: result.message,
      error: result.error,
      config: {
        environment: config.environment,
        hasApiKey: !!config.apiKey,
        simulationMode: config.simulationMode,
        simulationReason: config.simulationReason,
      },
    })
  } catch (error) {
    console.error("[API] Error probando Verifactu:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        config: {
          environment: "unknown",
          hasApiKey: false,
          simulationMode: true,
          simulationReason: "Error de configuración",
        },
      },
      { status: 500 },
    )
  }
}
