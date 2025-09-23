"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Globe,
  Calendar,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  ExternalLink,
  Euro,
  Users,
  TrendingUp,
  Shield,
} from "lucide-react"
import { formatCurrency, formatDate, formatRelativeTime, formatDateTime } from "@/lib/utils"
import type { Customer } from "@/lib/supabase-customers"

interface CustomerDetailsProps {
  customer: Customer
  onEdit?: () => void
}

export function CustomerDetails({ customer, onEdit }: CustomerDetailsProps) {
  const [isLoading, setIsLoading] = useState(false)

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "synced":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Sincronizado
          </Badge>
        )
      case "error":
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        )
      case "simulated":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Simulado
          </Badge>
        )
      case "pending":
      default:
        return (
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        )
    }
  }

  const getRiskBadge = (risk?: string) => {
    switch (risk) {
      case "low":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Bajo
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Medio
          </Badge>
        )
      case "high":
        return <Badge variant="destructive">Alto</Badge>
      default:
        return <Badge variant="outline">No definido</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{customer.name}</h1>
            {!customer.is_active && <Badge variant="secondary">Inactivo</Badge>}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Cliente desde {formatDate(customer.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Actualizado {formatRelativeTime(customer.updated_at)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(customer.verifactu_status)}
          <Button onClick={onEdit} variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
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
                      <p className="font-medium">{customer.phone}</p>
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
                  <p className="font-medium">{customer.tax_id}</p>
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

        {/* Commercial Tab */}
        <TabsContent value="commercial" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Business Information */}
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

            {/* Company Stats */}
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

          {/* Customer Timeline */}
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
            {/* Payment Information */}
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

            {/* Risk Assessment */}
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

          {/* Verifactu Status */}
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
