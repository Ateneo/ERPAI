"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, User, Building, CreditCard, FileText, MessageSquare } from "lucide-react"
import { validateSpanishTaxId } from "@/lib/verifactu-api"
import { CustomerService } from "@/lib/supabase-customers"

const customerSchema = z.object({
  // Basic Information
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email no válido"),
  phone: z.string().min(9, "Teléfono debe tener al menos 9 dígitos"),
  tax_id: z.string().min(9, "NIF/CIF debe tener 9 caracteres").refine(validateSpanishTaxId, "NIF/CIF no válido"),

  // Address
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  province: z.string().optional(),
  country: z.string().default("España"),

  // Contact
  contact_person: z.string().optional(),
  website: z.string().url("URL no válida").optional().or(z.literal("")),

  // Business
  sector: z.string().optional(),
  commercial_name: z.string().optional(),
  legal_form: z.string().optional(),
  registration_number: z.string().optional(),
  registration_date: z.string().optional(),
  share_capital: z.number().optional(),
  administrator: z.string().optional(),
  administrator_nif: z.string().optional(),
  business_activity: z.string().optional(),
  cnae_code: z.string().optional(),
  employees_count: z.number().optional(),
  annual_revenue: z.number().optional(),

  // Financial
  credit_limit: z.number().optional(),
  payment_terms: z.number().optional(),
  preferred_payment_method: z.string().optional(),
  bank_account: z.string().optional(),
  swift_code: z.string().optional(),
  tax_regime: z.string().optional(),
  vat_number: z.string().optional(),
  social_security_number: z.string().optional(),
  mutual_insurance: z.string().optional(),
  risk_level: z.enum(["low", "medium", "high"]).optional(),

  // Timeline
  customer_since: z.string().optional(),
  last_order_date: z.string().optional(),
  total_orders: z.number().optional(),
  average_order_value: z.number().optional(),

  // Notes
  notes: z.string().optional(),
})

type CustomerFormData = z.infer<typeof customerSchema>

interface CreateCustomerFormProps {
  onSuccess?: (customer: any) => void
  onCancel?: () => void
}

const SPANISH_PROVINCES = [
  "Álava",
  "Albacete",
  "Alicante",
  "Almería",
  "Asturias",
  "Ávila",
  "Badajoz",
  "Barcelona",
  "Burgos",
  "Cáceres",
  "Cádiz",
  "Cantabria",
  "Castellón",
  "Ciudad Real",
  "Córdoba",
  "Cuenca",
  "Girona",
  "Granada",
  "Guadalajara",
  "Guipúzcoa",
  "Huelva",
  "Huesca",
  "Islas Baleares",
  "Jaén",
  "La Coruña",
  "La Rioja",
  "Las Palmas",
  "León",
  "Lleida",
  "Lugo",
  "Madrid",
  "Málaga",
  "Murcia",
  "Navarra",
  "Ourense",
  "Palencia",
  "Pontevedra",
  "Salamanca",
  "Santa Cruz de Tenerife",
  "Segovia",
  "Sevilla",
  "Soria",
  "Tarragona",
  "Teruel",
  "Toledo",
  "Valencia",
  "Valladolid",
  "Vizcaya",
  "Zamora",
  "Zaragoza",
]

const BUSINESS_SECTORS = [
  "Tecnología",
  "Construcción",
  "Comercio",
  "Servicios",
  "Industria",
  "Agricultura",
  "Turismo",
  "Transporte",
  "Educación",
  "Sanidad",
  "Finanzas",
  "Inmobiliario",
  "Alimentación",
  "Textil",
  "Automoción",
  "Energía",
  "Telecomunicaciones",
  "Otros",
]

const LEGAL_FORMS = [
  "Sociedad Limitada (SL)",
  "Sociedad Anónima (SA)",
  "Autónomo",
  "Comunidad de Bienes",
  "Sociedad Civil",
  "Cooperativa",
  "Sociedad Laboral",
  "Fundación",
  "Asociación",
  "Otros",
]

const PAYMENT_METHODS = [
  "Transferencia bancaria",
  "Domiciliación bancaria",
  "Tarjeta de crédito",
  "Cheque",
  "Efectivo",
  "Pagaré",
  "Confirming",
  "Factoring",
  "Otros",
]

const TAX_REGIMES = [
  "Régimen General",
  "Régimen Simplificado",
  "Recargo de Equivalencia",
  "Exento",
  "Régimen Especial",
  "REBU",
  "Otros",
]

export function CreateCustomerForm({ onSuccess, onCancel }: CreateCustomerFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [taxIdValidation, setTaxIdValidation] = useState<{
    isValid: boolean
    message: string
  } | null>(null)
  const [submitResult, setSubmitResult] = useState<{
    success: boolean
    message: string
    verifactuSync?: any
  } | null>(null)

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      country: "España",
      risk_level: "medium",
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = form

  // Watch tax_id for real-time validation
  const taxId = watch("tax_id")

  // Validate tax ID in real-time
  const handleTaxIdChange = (value: string) => {
    setValue("tax_id", value.toUpperCase())

    if (value.length === 9) {
      const isValid = validateSpanishTaxId(value)
      setTaxIdValidation({
        isValid,
        message: isValid ? "NIF/CIF válido" : "NIF/CIF no válido",
      })
    } else {
      setTaxIdValidation(null)
    }
  }

  const onSubmit = async (data: CustomerFormData) => {
    setIsLoading(true)
    setSubmitResult(null)

    try {
      console.log("[Form] Enviando datos del cliente:", data)

      // Convert form data to customer format
      const customerData = {
        ...data,
        is_active: true,
        verifactu_status: "pending" as const,
      }

      // Create customer
      const customer = await CustomerService.createCustomer(customerData)

      console.log("[Form] Cliente creado exitosamente:", customer.id)

      setSubmitResult({
        success: true,
        message: "Cliente creado exitosamente",
      })

      // Call success callback
      if (onSuccess) {
        onSuccess(customer)
      }
    } catch (error) {
      console.error("[Form] Error creando cliente:", error)

      setSubmitResult({
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al crear el cliente",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Nuevo Cliente</h1>
          <p className="text-muted-foreground">
            Completa la información del cliente. Los campos marcados con * son obligatorios.
          </p>
        </div>
      </div>

      {submitResult && (
        <Alert className={submitResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <div className="flex items-center gap-2">
            {submitResult.success ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <AlertDescription className={submitResult.success ? "text-green-800" : "text-red-800"}>
              {submitResult.message}
            </AlertDescription>
          </div>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="business">Empresa</TabsTrigger>
            <TabsTrigger value="financial">Financiero</TabsTrigger>
            <TabsTrigger value="legal">Legal</TabsTrigger>
            <TabsTrigger value="notes">Notas</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Información Básica
                  </CardTitle>
                  <CardDescription>Datos principales del cliente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre / Razón Social *</Label>
                    <Input id="name" {...register("name")} placeholder="Nombre completo o razón social" />
                    {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="tax_id">NIF/CIF *</Label>
                    <Input
                      id="tax_id"
                      {...register("tax_id")}
                      onChange={(e) => handleTaxIdChange(e.target.value)}
                      placeholder="12345678A o A12345678"
                      maxLength={9}
                    />
                    {taxIdValidation && (
                      <div className="flex items-center gap-2 mt-1">
                        {taxIdValidation.isValid ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                        <p className={`text-sm ${taxIdValidation.isValid ? "text-green-600" : "text-red-600"}`}>
                          {taxIdValidation.message}
                        </p>
                      </div>
                    )}
                    {errors.tax_id && <p className="text-sm text-red-600 mt-1">{errors.tax_id.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" {...register("email")} placeholder="cliente@empresa.com" />
                    {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input id="phone" {...register("phone")} placeholder="600 123 456" />
                    {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="contact_person">Persona de Contacto</Label>
                    <Input
                      id="contact_person"
                      {...register("contact_person")}
                      placeholder="Nombre del contacto principal"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">Sitio Web</Label>
                    <Input id="website" {...register("website")} placeholder="https://www.empresa.com" />
                    {errors.website && <p className="text-sm text-red-600 mt-1">{errors.website.message}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Dirección
                  </CardTitle>
                  <CardDescription>Ubicación del cliente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Dirección</Label>
                    <Input id="address" {...register("address")} placeholder="Calle, número, piso, puerta" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Ciudad</Label>
                      <Input id="city" {...register("city")} placeholder="Madrid" />
                    </div>

                    <div>
                      <Label htmlFor="postal_code">Código Postal</Label>
                      <Input id="postal_code" {...register("postal_code")} placeholder="28001" maxLength={5} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="province">Provincia</Label>
                    <Select onValueChange={(value) => setValue("province", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una provincia" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPANISH_PROVINCES.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="country">País</Label>
                    <Input id="country" {...register("country")} placeholder="España" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Business Tab */}
          <TabsContent value="business" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Business Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Información Comercial</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="commercial_name">Nombre Comercial</Label>
                    <Input
                      id="commercial_name"
                      {...register("commercial_name")}
                      placeholder="Nombre comercial si es diferente"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sector">Sector</Label>
                    <Select onValueChange={(value) => setValue("sector", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un sector" />
                      </SelectTrigger>
                      <SelectContent>
                        {BUSINESS_SECTORS.map((sector) => (
                          <SelectItem key={sector} value={sector}>
                            {sector}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="business_activity">Actividad Empresarial</Label>
                    <Input
                      id="business_activity"
                      {...register("business_activity")}
                      placeholder="Descripción de la actividad"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cnae_code">Código CNAE</Label>
                    <Input id="cnae_code" {...register("cnae_code")} placeholder="1234" />
                  </div>

                  <div>
                    <Label htmlFor="employees_count">Número de Empleados</Label>
                    <Input
                      id="employees_count"
                      type="number"
                      {...register("employees_count", { valueAsNumber: true })}
                      placeholder="10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="annual_revenue">Facturación Anual (€)</Label>
                    <Input
                      id="annual_revenue"
                      type="number"
                      {...register("annual_revenue", { valueAsNumber: true })}
                      placeholder="100000"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Customer Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Historial del Cliente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="customer_since">Cliente Desde</Label>
                    <Input id="customer_since" type="date" {...register("customer_since")} />
                  </div>

                  <div>
                    <Label htmlFor="last_order_date">Último Pedido</Label>
                    <Input id="last_order_date" type="date" {...register("last_order_date")} />
                  </div>

                  <div>
                    <Label htmlFor="total_orders">Total de Pedidos</Label>
                    <Input
                      id="total_orders"
                      type="number"
                      {...register("total_orders", { valueAsNumber: true })}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="average_order_value">Valor Medio Pedido (€)</Label>
                    <Input
                      id="average_order_value"
                      type="number"
                      step="0.01"
                      {...register("average_order_value", { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Información de Pago
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="credit_limit">Límite de Crédito (€)</Label>
                    <Input
                      id="credit_limit"
                      type="number"
                      step="0.01"
                      {...register("credit_limit", { valueAsNumber: true })}
                      placeholder="5000.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="payment_terms">Plazo de Pago (días)</Label>
                    <Input
                      id="payment_terms"
                      type="number"
                      {...register("payment_terms", { valueAsNumber: true })}
                      placeholder="30"
                    />
                  </div>

                  <div>
                    <Label htmlFor="preferred_payment_method">Método de Pago Preferido</Label>
                    <Select onValueChange={(value) => setValue("preferred_payment_method", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un método" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="bank_account">Cuenta Bancaria (IBAN)</Label>
                    <Input
                      id="bank_account"
                      {...register("bank_account")}
                      placeholder="ES12 1234 5678 9012 3456 7890"
                    />
                  </div>

                  <div>
                    <Label htmlFor="swift_code">Código SWIFT</Label>
                    <Input id="swift_code" {...register("swift_code")} placeholder="BBVAESMM" />
                  </div>
                </CardContent>
              </Card>

              {/* Risk and Tax */}
              <Card>
                <CardHeader>
                  <CardTitle>Riesgo y Fiscal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="risk_level">Nivel de Riesgo</Label>
                    <Select onValueChange={(value) => setValue("risk_level", value as "low" | "medium" | "high")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Bajo</SelectItem>
                        <SelectItem value="medium">Medio</SelectItem>
                        <SelectItem value="high">Alto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tax_regime">Régimen Fiscal</Label>
                    <Select onValueChange={(value) => setValue("tax_regime", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el régimen" />
                      </SelectTrigger>
                      <SelectContent>
                        {TAX_REGIMES.map((regime) => (
                          <SelectItem key={regime} value={regime}>
                            {regime}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="vat_number">Número IVA</Label>
                    <Input id="vat_number" {...register("vat_number")} placeholder="ESA12345678" />
                  </div>

                  <div>
                    <Label htmlFor="social_security_number">Número Seguridad Social</Label>
                    <Input
                      id="social_security_number"
                      {...register("social_security_number")}
                      placeholder="123456789012"
                    />
                  </div>

                  <div>
                    <Label htmlFor="mutual_insurance">Mutua de Seguros</Label>
                    <Input id="mutual_insurance" {...register("mutual_insurance")} placeholder="Nombre de la mutua" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Legal Tab */}
          <TabsContent value="legal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Información Legal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="legal_form">Forma Jurídica</Label>
                      <Select onValueChange={(value) => setValue("legal_form", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona la forma jurídica" />
                        </SelectTrigger>
                        <SelectContent>
                          {LEGAL_FORMS.map((form) => (
                            <SelectItem key={form} value={form}>
                              {form}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="registration_number">Número de Registro</Label>
                      <Input
                        id="registration_number"
                        {...register("registration_number")}
                        placeholder="Número de registro mercantil"
                      />
                    </div>

                    <div>
                      <Label htmlFor="registration_date">Fecha de Constitución</Label>
                      <Input id="registration_date" type="date" {...register("registration_date")} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="share_capital">Capital Social (€)</Label>
                      <Input
                        id="share_capital"
                        type="number"
                        step="0.01"
                        {...register("share_capital", { valueAsNumber: true })}
                        placeholder="3000.00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="administrator">Administrador</Label>
                      <Input id="administrator" {...register("administrator")} placeholder="Nombre del administrador" />
                    </div>

                    <div>
                      <Label htmlFor="administrator_nif">NIF del Administrador</Label>
                      <Input
                        id="administrator_nif"
                        {...register("administrator_nif")}
                        placeholder="12345678A"
                        maxLength={9}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Notas y Observaciones
                </CardTitle>
                <CardDescription>Información adicional sobre el cliente</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    {...register("notes")}
                    placeholder="Información adicional, observaciones, historial de contactos, etc."
                    rows={8}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creando cliente...
              </>
            ) : (
              "Crear Cliente"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
