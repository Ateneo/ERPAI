"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Building,
  Globe,
  FileText,
  User,
  Calendar,
  Clock,
  Euro,
  CreditCard,
  Shield,
  TrendingUp,
  Users,
  ExternalLink,
  CheckCircle,
} from "lucide-react"
import { CustomerServicesTab } from "./customer-services-tab"

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  province?: string
  country?: string
  tax_id?: string
  vat_number?: string
  sector?: string
  status?: string
  notes?: string
  contact_person?: string
  website?: string
  commercial_name?: string
  business_activity?: string
  cnae_code?: string
  legal_form?: string
  registration_number?: string
  registration_date?: string
  share_capital?: number
  employees_count?: number
  annual_revenue?: number
  credit_limit?: number
  payment_terms?: number
  preferred_payment_method?: string
  bank_account?: string
  swift_code?: string
  tax_regime?: string
  administrator?: string
  administrator_nif?: string
  mutual_insurance?: string
  social_security_number?: string
  risk_level?: string
  customer_since?: string
  last_order_date?: string
  total_orders?: number
  average_order_value?: number
  verifactu_id?: string
  verifactu_status?: string
  verifactu_message?: string
  verifactu_synced_at?: string
  created_at?: string
  updated_at?: string
}

interface CustomerDetailsProps {
  customer: Customer
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-ES")
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString("es-ES")
}

const getStatusBadge = (status?: string) => {
  switch (status) {
    case "synced":
      return <Badge className="bg-green-100 text-green-800">Sincronizado</Badge>
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
    case "error":
      return <Badge className="bg-red-100 text-red-800">Error</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-800">Sin sincronizar</Badge>
  }
}

const getRiskBadge = (risk?: string) => {
  switch (risk) {
    case "low":
      return <Badge className="bg-green-100 text-green-800">Bajo</Badge>
    case "medium":
      return <Badge className="bg-yellow-100 text-yellow-800">Medio</Badge>
    case "high":
      return <Badge className="bg-red-100 text-red-800">Alto</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-800">Sin evaluar</Badge>
  }
}

export function CustomerDetails({ customer, onBack, onEdit, onDelete }: CustomerDetailsProps) {
  if (!customer) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cargando cliente...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{customer.name}</h2>
            <p className="text-muted-foreground">{customer.tax_id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="services">Servicios</TabsTrigger>
          <TabsTrigger value="commercial">Comercial</TabsTrigger>
          <TabsTrigger value="financial">Financiero</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
          <TabsTrigger value="observations">Observaciones</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{customer.email}</p>
                      <p className="text-sm text-muted-foreground">Email principal</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{customer.phone || "No especificado"}</p>
                      <p className="text-sm text-muted-foreground">Teléfono</p>
                    </div>
                  </div>
                  {customer.contact_person && (
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{customer.contact_person}</p>
                        <p className="text-sm text-muted-foreground">Persona de contacto</p>
                      </div>
                    </div>
                  )}
                  {customer.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <a
                          href={customer.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {customer.website}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <p className="text-sm text-muted-foreground">Sitio web</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Dirección
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {customer.address && (
                  <div>
                    <p className="font-medium">{customer.address}</p>
                    <p className="text-sm text-muted-foreground">Dirección</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {customer.city && (
                    <div>
                      <p className="font-medium">{customer.city}</p>
                      <p className="text-sm text-muted-foreground">Ciudad</p>
                    </div>
                  )}
                  {customer.postal_code && (
                    <div>
                      <p className="font-medium">{customer.postal_code}</p>
                      <p className="text-sm text-muted-foreground">Código postal</p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {customer.province && (
                    <div>
                      <p className="font-medium">{customer.province}</p>
                      <p className="text-sm text-muted-foreground">Provincia</p>
                    </div>
                  )}
                  {customer.country && (
                    <div>
                      <p className="font-medium">{customer.country}</p>
                      <p className="text-sm text-muted-foreground">País</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tax Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Información Fiscal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="font-medium">{customer.tax_id || "No especificado"}</p>
                  <p className="text-sm text-muted-foreground">NIF/CIF</p>
                </div>
                {customer.vat_number && (
                  <div>
                    <p className="font-medium">{customer.vat_number}</p>
                    <p className="text-sm text-muted-foreground">Número IVA</p>
                  </div>
                )}
                {customer.tax_regime && (
                  <div>
                    <p className="font-medium">{customer.tax_regime}</p>
                    <p className="text-sm text-muted-foreground">Régimen fiscal</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <CustomerServicesTab customerId={customer.id} customerName={customer.name} />
        </TabsContent>

        {/* Commercial Tab */}
        <TabsContent value="commercial" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Información Comercial
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {customer.commercial_name && (
                  <div>
                    <p className="font-medium">{customer.commercial_name}</p>
                    <p className="text-sm text-muted-foreground">Nombre comercial</p>
                  </div>
                )}
                {customer.sector && (
                  <div>
                    <p className="font-medium">{customer.sector}</p>
                    <p className="text-sm text-muted-foreground">Sector</p>
                  </div>
                )}
                {customer.business_activity && (
                  <div>
                    <p className="font-medium">{customer.business_activity}</p>
                    <p className="text-sm text-muted-foreground">Actividad empresarial</p>
                  </div>
                )}
                {customer.cnae_code && (
                  <div>
                    <p className="font-medium">{customer.cnae_code}</p>
                    <p className="text-sm text-muted-foreground">Código CNAE</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Estadísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {customer.employees_count && (
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{customer.employees_count} empleados</p>
                      <p className="text-sm text-muted-foreground">Plantilla</p>
                    </div>
                  </div>
                )}
                {customer.annual_revenue && (
                  <div className="flex items-center gap-3">
                    <Euro className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{formatCurrency(customer.annual_revenue)}</p>
                      <p className="text-sm text-muted-foreground">Facturación anual</p>
                    </div>
                  </div>
                )}
                {customer.total_orders && (
                  <div>
                    <p className="font-medium">{customer.total_orders} pedidos</p>
                    <p className="text-sm text-muted-foreground">Total de pedidos</p>
                  </div>
                )}
                {customer.average_order_value && (
                  <div>
                    <p className="font-medium">{formatCurrency(customer.average_order_value)}</p>
                    <p className="text-sm text-muted-foreground">Valor medio pedido</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Historial del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {customer.customer_since && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Cliente desde {formatDate(customer.customer_since)}</p>
                    <p className="text-sm text-muted-foreground">Fecha de alta</p>
                  </div>
                </div>
              )}
              {customer.last_order_date && (
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Último pedido: {formatDate(customer.last_order_date)}</p>
                    <p className="text-sm text-muted-foreground">Actividad reciente</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
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
                {customer.credit_limit && (
                  <div>
                    <p className="font-medium">{formatCurrency(customer.credit_limit)}</p>
                    <p className="text-sm text-muted-foreground">Límite de crédito</p>
                  </div>
                )}
                {customer.payment_terms && (
                  <div>
                    <p className="font-medium">{customer.payment_terms} días</p>
                    <p className="text-sm text-muted-foreground">Plazo de pago</p>
                  </div>
                )}
                {customer.preferred_payment_method && (
                  <div>
                    <p className="font-medium">{customer.preferred_payment_method}</p>
                    <p className="text-sm text-muted-foreground">Método de pago preferido</p>
                  </div>
                )}
                {customer.bank_account && (
                  <div>
                    <p className="font-medium">{customer.bank_account}</p>
                    <p className="text-sm text-muted-foreground">Cuenta bancaria</p>
                  </div>
                )}
                {customer.swift_code && (
                  <div>
                    <p className="font-medium">{customer.swift_code}</p>
                    <p className="text-sm text-muted-foreground">Código SWIFT</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Evaluación de Riesgo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">Nivel de riesgo:</span>
                    {getRiskBadge(customer.risk_level)}
                  </div>
                </div>
                {customer.mutual_insurance && (
                  <div>
                    <p className="font-medium">{customer.mutual_insurance}</p>
                    <p className="text-sm text-muted-foreground">Mutua de seguros</p>
                  </div>
                )}
                {customer.social_security_number && (
                  <div>
                    <p className="font-medium">{customer.social_security_number}</p>
                    <p className="text-sm text-muted-foreground">Número Seguridad Social</p>
                  </div>
                )}
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
                  {customer.legal_form && (
                    <div>
                      <p className="font-medium">{customer.legal_form}</p>
                      <p className="text-sm text-muted-foreground">Forma jurídica</p>
                    </div>
                  )}
                  {customer.registration_number && (
                    <div>
                      <p className="font-medium">{customer.registration_number}</p>
                      <p className="text-sm text-muted-foreground">Número de registro</p>
                    </div>
                  )}
                  {customer.registration_date && (
                    <div>
                      <p className="font-medium">{formatDate(customer.registration_date)}</p>
                      <p className="text-sm text-muted-foreground">Fecha de constitución</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {customer.share_capital && (
                    <div>
                      <p className="font-medium">{formatCurrency(customer.share_capital)}</p>
                      <p className="text-sm text-muted-foreground">Capital social</p>
                    </div>
                  )}
                  {customer.administrator && (
                    <div>
                      <p className="font-medium">{customer.administrator}</p>
                      <p className="text-sm text-muted-foreground">Administrador</p>
                    </div>
                  )}
                  {customer.administrator_nif && (
                    <div>
                      <p className="font-medium">{customer.administrator_nif}</p>
                      <p className="text-sm text-muted-foreground">NIF del administrador</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Estado Verifactu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Estado:</span>
                {getStatusBadge(customer.verifactu_status)}
              </div>
              {customer.verifactu_id && (
                <div>
                  <p className="font-medium">{customer.verifactu_id}</p>
                  <p className="text-sm text-muted-foreground">ID Verifactu</p>
                </div>
              )}
              {customer.verifactu_message && (
                <div>
                  <p className="text-sm">{customer.verifactu_message}</p>
                  <p className="text-sm text-muted-foreground">Último mensaje</p>
                </div>
              )}
              {customer.verifactu_synced_at && (
                <div>
                  <p className="text-sm">{formatDateTime(customer.verifactu_synced_at)}</p>
                  <p className="text-sm text-muted-foreground">Última sincronización</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Observations Tab */}
        <TabsContent value="observations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Notas y Observaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customer.notes ? (
                <div className="whitespace-pre-wrap text-sm">{customer.notes}</div>
              ) : (
                <p className="text-muted-foreground text-sm">No hay observaciones registradas para este cliente.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
