"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, User, Building, CreditCard, FileText, ArrowLeft, Save } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

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

// Inline validation function
function validateSpanishTaxId(taxId: string): boolean {
  if (!taxId || taxId.length !== 9) return false
  const cleanTaxId = taxId.toUpperCase().replace(/[^A-Z0-9]/g, "")
  if (cleanTaxId.length !== 9) return false

  const cifLetters = "ABCDEFGHJNPQRSUVW"
  const firstChar = cleanTaxId[0]

  if (cifLetters.includes(firstChar)) return true
  if ("XYZ".includes(firstChar)) return true
  if (/^[0-9KLM]/.test(firstChar)) return true

  return false
}

interface CreateCustomerFormProps {
  onSuccess?: (customer: any) => void
  onCancel?: () => void
  onBack?: () => void
  editingCustomer?: any
}

export function CreateCustomerForm({ onSuccess, onCancel, onBack, editingCustomer }: CreateCustomerFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [taxIdValidation, setTaxIdValidation] = useState<{ isValid: boolean; message: string } | null>(null)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null)

  const [formData, setFormData] = useState({
    name: editingCustomer?.name || "",
    email: editingCustomer?.email || "",
    phone: editingCustomer?.phone || "",
    tax_id: editingCustomer?.tax_id || "",
    address: editingCustomer?.address || "",
    city: editingCustomer?.city || "",
    postal_code: editingCustomer?.postal_code || "",
    province: editingCustomer?.province || "",
    country: editingCustomer?.country || "España",
    contact_person: editingCustomer?.contact_person || "",
    website: editingCustomer?.website || "",
    sector: editingCustomer?.sector || "",
    commercial_name: editingCustomer?.commercial_name || "",
    legal_form: editingCustomer?.legal_form || "",
    business_activity: editingCustomer?.business_activity || "",
    cnae_code: editingCustomer?.cnae_code || "",
    employees_count: editingCustomer?.employees_count || "",
    annual_revenue: editingCustomer?.annual_revenue || "",
    credit_limit: editingCustomer?.credit_limit || "",
    payment_terms: editingCustomer?.payment_terms || "30",
    preferred_payment_method: editingCustomer?.preferred_payment_method || "",
    bank_account: editingCustomer?.bank_account || "",
    tax_regime: editingCustomer?.tax_regime || "",
    risk_level: editingCustomer?.risk_level || "medium",
    notes: editingCustomer?.notes || "",
    status: editingCustomer?.status || "active",
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }

    if (field === "tax_id" && value.length > 0) {
      const isValid = validateSpanishTaxId(value)
      setTaxIdValidation({
        isValid,
        message: isValid ? "NIF/CIF válido" : "NIF/CIF no válido",
      })
    } else if (field === "tax_id") {
      setTaxIdValidation(null)
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio"
    if (!formData.email.trim()) newErrors.email = "El email es obligatorio"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Email no válido"
    if (!formData.phone.trim()) newErrors.phone = "El teléfono es obligatorio"
    if (!formData.tax_id.trim()) newErrors.tax_id = "El NIF/CIF es obligatorio"
    else if (!validateSpanishTaxId(formData.tax_id)) newErrors.tax_id = "NIF/CIF no válido"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    setSubmitResult(null)

    try {
      const customerData = {
        ...formData,
        employees_count: formData.employees_count ? Number.parseInt(formData.employees_count) : null,
        annual_revenue: formData.annual_revenue ? Number.parseFloat(formData.annual_revenue) : null,
        credit_limit: formData.credit_limit ? Number.parseFloat(formData.credit_limit) : null,
        payment_terms: formData.payment_terms ? Number.parseInt(formData.payment_terms) : 30,
        is_active: true,
        updated_at: new Date().toISOString(),
      }

      if (editingCustomer?.id) {
        const { error } = await supabase.from("customers").update(customerData).eq("id", editingCustomer.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from("customers")
          .insert([{ ...customerData, created_at: new Date().toISOString() }])
        if (error) throw error
      }

      setSubmitResult({
        success: true,
        message: editingCustomer ? "Cliente actualizado" : "Cliente creado correctamente",
      })
      setTimeout(() => {
        onSuccess?.(customerData)
        onBack?.()
      }, 1500)
    } catch (error: any) {
      setSubmitResult({ success: false, message: error.message || "Error al guardar el cliente" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    onBack?.() || onCancel?.()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{editingCustomer ? "Editar Cliente" : "Nuevo Cliente"}</h1>
          <p className="text-muted-foreground">Los campos marcados con * son obligatorios.</p>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="business">Empresa</TabsTrigger>
            <TabsTrigger value="financial">Financiero</TabsTrigger>
            <TabsTrigger value="notes">Notas</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Información Básica
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre / Razón Social *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Nombre completo o razón social"
                    />
                    {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="tax_id">NIF/CIF *</Label>
                    <Input
                      id="tax_id"
                      value={formData.tax_id}
                      onChange={(e) => handleChange("tax_id", e.target.value.toUpperCase())}
                      placeholder="12345678A"
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
                    {errors.tax_id && <p className="text-sm text-red-600 mt-1">{errors.tax_id}</p>}
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="cliente@empresa.com"
                    />
                    {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="600 123 456"
                    />
                    {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <Label htmlFor="contact_person">Persona de Contacto</Label>
                    <Input
                      id="contact_person"
                      value={formData.contact_person}
                      onChange={(e) => handleChange("contact_person", e.target.value)}
                      placeholder="Nombre del contacto"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Sitio Web</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleChange("website", e.target.value)}
                      placeholder="https://www.empresa.com"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Dirección
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder="Calle, número, piso"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Ciudad</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        placeholder="Madrid"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postal_code">Código Postal</Label>
                      <Input
                        id="postal_code"
                        value={formData.postal_code}
                        onChange={(e) => handleChange("postal_code", e.target.value)}
                        placeholder="28001"
                        maxLength={5}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="province">Provincia</Label>
                    <Select value={formData.province} onValueChange={(value) => handleChange("province", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona provincia" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPANISH_PROVINCES.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="country">País</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleChange("country", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="business" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Información Comercial</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="commercial_name">Nombre Comercial</Label>
                    <Input
                      id="commercial_name"
                      value={formData.commercial_name}
                      onChange={(e) => handleChange("commercial_name", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sector">Sector</Label>
                    <Select value={formData.sector} onValueChange={(value) => handleChange("sector", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona sector" />
                      </SelectTrigger>
                      <SelectContent>
                        {BUSINESS_SECTORS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="legal_form">Forma Jurídica</Label>
                    <Select value={formData.legal_form} onValueChange={(value) => handleChange("legal_form", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona forma jurídica" />
                      </SelectTrigger>
                      <SelectContent>
                        {LEGAL_FORMS.map((l) => (
                          <SelectItem key={l} value={l}>
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="business_activity">Actividad Empresarial</Label>
                    <Input
                      id="business_activity"
                      value={formData.business_activity}
                      onChange={(e) => handleChange("business_activity", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cnae_code">Código CNAE</Label>
                    <Input
                      id="cnae_code"
                      value={formData.cnae_code}
                      onChange={(e) => handleChange("cnae_code", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Datos de Empresa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="employees_count">Número de Empleados</Label>
                    <Input
                      id="employees_count"
                      type="number"
                      value={formData.employees_count}
                      onChange={(e) => handleChange("employees_count", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="annual_revenue">Facturación Anual (€)</Label>
                    <Input
                      id="annual_revenue"
                      type="number"
                      value={formData.annual_revenue}
                      onChange={(e) => handleChange("annual_revenue", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Estado</Label>
                    <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                        <SelectItem value="prospect">Prospecto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      value={formData.credit_limit}
                      onChange={(e) => handleChange("credit_limit", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="payment_terms">Plazo de Pago (días)</Label>
                    <Input
                      id="payment_terms"
                      type="number"
                      value={formData.payment_terms}
                      onChange={(e) => handleChange("payment_terms", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="preferred_payment_method">Método de Pago</Label>
                    <Select
                      value={formData.preferred_payment_method}
                      onValueChange={(value) => handleChange("preferred_payment_method", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona método" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="bank_account">Cuenta Bancaria (IBAN)</Label>
                    <Input
                      id="bank_account"
                      value={formData.bank_account}
                      onChange={(e) => handleChange("bank_account", e.target.value)}
                      placeholder="ES12 1234 5678 90 1234567890"
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Información Fiscal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="tax_regime">Régimen Fiscal</Label>
                    <Select value={formData.tax_regime} onValueChange={(value) => handleChange("tax_regime", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona régimen" />
                      </SelectTrigger>
                      <SelectContent>
                        {TAX_REGIMES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="risk_level">Nivel de Riesgo</Label>
                    <Select value={formData.risk_level} onValueChange={(value) => handleChange("risk_level", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Bajo</SelectItem>
                        <SelectItem value="medium">Medio</SelectItem>
                        <SelectItem value="high">Alto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Notas y Observaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Notas adicionales..."
                  rows={6}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleBack}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {editingCustomer ? "Actualizar" : "Crear"} Cliente
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
