"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useSettings } from "@/contexts/settings-context"
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Upload,
  Download,
  FileText,
  Users,
  Receipt,
  Calculator,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings()
  const [activeTab, setActiveTab] = useState("general")

  const handleSettingChange = (key: string, value: any) => {
    updateSettings({ [key]: value })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Configuración</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Apariencia
          </TabsTrigger>
          <TabsTrigger value="import-export" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Import/Export
          </TabsTrigger>
        </TabsList>

        {/* Configuración General */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>Ajusta las configuraciones básicas de la aplicación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Nombre de la Empresa</Label>
                  <Input
                    id="company-name"
                    value={settings.companyName || ""}
                    onChange={(e) => handleSettingChange("companyName", e.target.value)}
                    placeholder="Mi Empresa S.L."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-tax-id">NIF/CIF</Label>
                  <Input
                    id="company-tax-id"
                    value={settings.companyTaxId || ""}
                    onChange={(e) => handleSettingChange("companyTaxId", e.target.value)}
                    placeholder="B12345678"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-address">Dirección</Label>
                <Textarea
                  id="company-address"
                  value={settings.companyAddress || ""}
                  onChange={(e) => handleSettingChange("companyAddress", e.target.value)}
                  placeholder="Calle Principal 123, 28001 Madrid"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-phone">Teléfono</Label>
                  <Input
                    id="company-phone"
                    value={settings.companyPhone || ""}
                    onChange={(e) => handleSettingChange("companyPhone", e.target.value)}
                    placeholder="+34 91 123 45 67"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email">Email</Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={settings.companyEmail || ""}
                    onChange={(e) => handleSettingChange("companyEmail", e.target.value)}
                    placeholder="info@miempresa.com"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Configuración Regional</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Moneda</Label>
                    <Select
                      value={settings.currency || "EUR"}
                      onValueChange={(value) => handleSettingChange("currency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="USD">Dólar ($)</SelectItem>
                        <SelectItem value="GBP">Libra (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Zona Horaria</Label>
                    <Select
                      value={settings.timezone || "Europe/Madrid"}
                      onValueChange={(value) => handleSettingChange("timezone", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Europe/Madrid">Madrid (CET)</SelectItem>
                        <SelectItem value="Europe/London">Londres (GMT)</SelectItem>
                        <SelectItem value="America/New_York">Nueva York (EST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Perfil de Usuario */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Perfil</CardTitle>
              <CardDescription>Gestiona tu información personal y preferencias</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">Nombre</Label>
                  <Input
                    id="first-name"
                    value={settings.firstName || ""}
                    onChange={(e) => handleSettingChange("firstName", e.target.value)}
                    placeholder="Juan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Apellidos</Label>
                  <Input
                    id="last-name"
                    value={settings.lastName || ""}
                    onChange={(e) => handleSettingChange("lastName", e.target.value)}
                    placeholder="García López"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.userEmail || ""}
                  onChange={(e) => handleSettingChange("userEmail", e.target.value)}
                  placeholder="juan@miempresa.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={settings.userPhone || ""}
                  onChange={(e) => handleSettingChange("userPhone", e.target.value)}
                  placeholder="+34 600 123 456"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Cargo</Label>
                <Input
                  id="position"
                  value={settings.userPosition || ""}
                  onChange={(e) => handleSettingChange("userPosition", e.target.value)}
                  placeholder="Director Financiero"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificaciones */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Notificaciones</CardTitle>
              <CardDescription>Configura cómo y cuándo recibir notificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir notificaciones importantes por correo electrónico
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications || false}
                    onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones Push</Label>
                    <p className="text-sm text-muted-foreground">Recibir notificaciones en el navegador</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications || false}
                    onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Recordatorios de Facturas</Label>
                    <p className="text-sm text-muted-foreground">Notificar sobre facturas próximas a vencer</p>
                  </div>
                  <Switch
                    checked={settings.invoiceReminders || true}
                    onCheckedChange={(checked) => handleSettingChange("invoiceReminders", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Resumen Semanal</Label>
                    <p className="text-sm text-muted-foreground">Recibir un resumen semanal de actividad</p>
                  </div>
                  <Switch
                    checked={settings.weeklyDigest || false}
                    onCheckedChange={(checked) => handleSettingChange("weeklyDigest", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Seguridad */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Seguridad</CardTitle>
              <CardDescription>Gestiona la seguridad de tu cuenta y datos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Autenticación de Dos Factores</Label>
                    <p className="text-sm text-muted-foreground">Añade una capa extra de seguridad a tu cuenta</p>
                  </div>
                  <Switch
                    checked={settings.twoFactorAuth || false}
                    onCheckedChange={(checked) => handleSettingChange("twoFactorAuth", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Cerrar Sesión Automáticamente</Label>
                    <p className="text-sm text-muted-foreground">Cerrar sesión después de un período de inactividad</p>
                  </div>
                  <Switch
                    checked={settings.autoLogout || true}
                    onCheckedChange={(checked) => handleSettingChange("autoLogout", checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cambiar Contraseña</h3>
                <div className="space-y-2">
                  <Label htmlFor="current-password">Contraseña Actual</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nueva Contraseña</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <Button>Cambiar Contraseña</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Apariencia */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personalización de Apariencia</CardTitle>
              <CardDescription>Personaliza la apariencia de la aplicación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <Select
                    value={settings.theme || "system"}
                    onValueChange={(value) => handleSettingChange("theme", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Oscuro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <Select
                    value={settings.language || "es"}
                    onValueChange={(value) => handleSettingChange("language", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Densidad de la Interfaz</Label>
                  <Select
                    value={settings.density || "comfortable"}
                    onValueChange={(value) => handleSettingChange("density", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compacta</SelectItem>
                      <SelectItem value="comfortable">Cómoda</SelectItem>
                      <SelectItem value="spacious">Espaciosa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Animaciones</Label>
                    <p className="text-sm text-muted-foreground">Habilitar animaciones en la interfaz</p>
                  </div>
                  <Switch
                    checked={settings.animations !== false}
                    onCheckedChange={(checked) => handleSettingChange("animations", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sonidos</Label>
                    <p className="text-sm text-muted-foreground">Reproducir sonidos para notificaciones</p>
                  </div>
                  <Switch
                    checked={settings.sounds || false}
                    onCheckedChange={(checked) => handleSettingChange("sounds", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import/Export */}
        <TabsContent value="import-export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Importación y Exportación de Datos</CardTitle>
              <CardDescription>Gestiona la importación y exportación de datos de la aplicación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sección de Importación */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Importar Datos
                </h3>
                <p className="text-sm text-muted-foreground">
                  Importa datos desde archivos CSV, Excel o TSV. Asegúrate de que los archivos sigan el formato
                  correcto.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Importar Clientes */}
                  <Card className="border-2 border-dashed border-muted hover:border-primary/50 transition-colors">
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Clientes</h4>
                        <p className="text-sm text-muted-foreground">Importar lista de clientes</p>
                      </div>
                      <div className="space-y-2">
                        <Link href="/import/customers">
                          <Button className="w-full" size="sm">
                            <Upload className="h-4 w-4 mr-2" />
                            Importar Clientes
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          <Download className="h-4 w-4 mr-2" />
                          Descargar Plantilla
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">
                          CSV
                        </Badge>
                        <Badge variant="secondary" className="text-xs ml-1">
                          Excel
                        </Badge>
                        <Badge variant="secondary" className="text-xs ml-1">
                          TSV
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Importar Presupuestos */}
                  <Card className="border-2 border-dashed border-muted hover:border-primary/50 transition-colors">
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                        <Calculator className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Presupuestos</h4>
                        <p className="text-sm text-muted-foreground">Importar presupuestos y cotizaciones</p>
                      </div>
                      <div className="space-y-2">
                        <Button className="w-full" size="sm" disabled>
                          <Upload className="h-4 w-4 mr-2" />
                          Próximamente
                        </Button>
                        <Button variant="outline" size="sm" className="w-full bg-transparent" disabled>
                          <Download className="h-4 w-4 mr-2" />
                          Descargar Plantilla
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">
                          CSV
                        </Badge>
                        <Badge variant="secondary" className="text-xs ml-1">
                          Excel
                        </Badge>
                        <Badge variant="secondary" className="text-xs ml-1">
                          TSV
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Importar Facturas */}
                  <Card className="border-2 border-dashed border-muted hover:border-primary/50 transition-colors">
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                        <Receipt className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Facturas</h4>
                        <p className="text-sm text-muted-foreground">Importar facturas emitidas</p>
                      </div>
                      <div className="space-y-2">
                        <Button className="w-full" size="sm" disabled>
                          <Upload className="h-4 w-4 mr-2" />
                          Próximamente
                        </Button>
                        <Button variant="outline" size="sm" className="w-full bg-transparent" disabled>
                          <Download className="h-4 w-4 mr-2" />
                          Descargar Plantilla
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">
                          CSV
                        </Badge>
                        <Badge variant="secondary" className="text-xs ml-1">
                          Excel
                        </Badge>
                        <Badge variant="secondary" className="text-xs ml-1">
                          TSV
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    💡 Consejos para la Importación
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Descarga la plantilla correspondiente antes de importar</li>
                    <li>• Asegúrate de que los campos obligatorios estén completos</li>
                    <li>• Los NIF/CIF deben tener formato español válido</li>
                    <li>• Máximo 1000 registros por archivo</li>
                    <li>• Formatos soportados: CSV, Excel (.xlsx, .xls), TSV</li>
                  </ul>
                </div>
              </div>

              <Separator />

              {/* Sección de Exportación */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Exportar Datos
                </h3>
                <p className="text-sm text-muted-foreground">
                  Exporta tus datos en diferentes formatos para análisis o respaldo.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-semibold">Exportar Clientes</h4>
                          <p className="text-sm text-muted-foreground">Todos los datos de clientes</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <FileText className="h-4 w-4 mr-2" />
                          CSV
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <FileText className="h-4 w-4 mr-2" />
                          Excel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Receipt className="h-5 w-5 text-purple-600" />
                        <div>
                          <h4 className="font-semibold">Exportar Facturas</h4>
                          <p className="text-sm text-muted-foreground">Historial de facturación</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <FileText className="h-4 w-4 mr-2" />
                          CSV
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <FileText className="h-4 w-4 mr-2" />
                          Excel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Calculator className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-semibold">Exportar Presupuestos</h4>
                          <p className="text-sm text-muted-foreground">Cotizaciones y presupuestos</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <FileText className="h-4 w-4 mr-2" />
                          CSV
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <FileText className="h-4 w-4 mr-2" />
                          Excel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Database className="h-5 w-5 text-orange-600" />
                        <div>
                          <h4 className="font-semibold">Respaldo Completo</h4>
                          <p className="text-sm text-muted-foreground">Todos los datos de la aplicación</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        <Download className="h-4 w-4 mr-2" />
                        Descargar Respaldo
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator />

              {/* Configuración de Korefactu */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Integración Korefactu
                </h3>
                <p className="text-sm text-muted-foreground">
                  Configura la integración con Korefactu para el sistema Verifactu de la AEAT para la validación
                  automática de clientes.
                </p>

                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-amber-900 dark:text-amber-100">Modo Simulación Activo</h4>
                      <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                        Actualmente funcionando en modo simulación. Para usar la API real de Korefactu, configura las
                        variables de entorno API_KOREFACTU y URL_KOREFACTU.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="korefactu-url">URL de la API</Label>
                    <Input id="korefactu-url" value="https://api.korefactu.com" disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="korefactu-status">Estado</Label>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span className="text-sm">Simulación</span>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full bg-transparent">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Probar Conexión
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
