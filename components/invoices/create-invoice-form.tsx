"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Save, X } from "lucide-react"

export function CreateInvoiceForm({ customers, products, onInvoiceCreated, onCancel }) {
  const [formData, setFormData] = useState({
    customer_id: "",
    issue_date: new Date().toISOString().split("T")[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "",
    payment_terms: "Pago a 30 días",
  })

  const [items, setItems] = useState([
    { product_id: "default", description: "", quantity: 1, unit_price: 0, tax_rate: 21 },
  ])

  const addItem = () => {
    setItems([...items, { product_id: "default", description: "", quantity: 1, unit_price: 0, tax_rate: 21 }])
  }

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index, field, value) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }

    // Si se selecciona un producto, auto-completar datos
    if (field === "product_id" && value) {
      const product = products.find((p) => p.id === value)
      if (product) {
        updatedItems[index].description = product.name
        updatedItems[index].unit_price = product.price
        updatedItems[index].tax_rate = product.tax_rate
      }
    }

    setItems(updatedItems)
  }

  const calculateItemTotal = (item) => {
    const subtotal = item.quantity * item.unit_price
    const tax = subtotal * (item.tax_rate / 100)
    return subtotal + tax
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
    const taxAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price * item.tax_rate) / 100, 0)
    const total = subtotal + taxAmount
    return { subtotal, taxAmount, total }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const { subtotal, taxAmount, total } = calculateTotals()
    const customer = customers.find((c) => c.id === formData.customer_id)

    const newInvoice = {
      id: Date.now().toString(),
      invoice_number: `INV-2024-${String(Date.now()).slice(-4)}`,
      ...formData,
      customer_name: customer?.name || "",
      subtotal,
      tax_amount: taxAmount,
      total_amount: total,
      currency: "EUR",
      status: "draft",
      items: items.filter((item) => item.description && item.quantity > 0),
    }

    onInvoiceCreated(newInvoice)
  }

  const { subtotal, taxAmount, total } = calculateTotals()

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Crear Nueva Factura</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Cliente</Label>
              <Select
                value={formData.customer_id}
                onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue_date">Fecha de emisión</Label>
              <Input
                id="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Fecha de vencimiento</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_terms">Términos de pago</Label>
              <Input
                id="payment_terms"
                value={formData.payment_terms}
                onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                placeholder="Ej: Pago a 30 días"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionales..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Líneas de Factura</CardTitle>
            <Button type="button" onClick={addItem} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Añadir línea
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto/Servicio</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>IVA %</TableHead>
                <TableHead>Total</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Select value={item.product_id} onValueChange={(value) => updateItem(index, "product_id", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Personalizado</SelectItem>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(index, "description", e.target.value)}
                      placeholder="Descripción"
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", Number.parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, "unit_price", Number.parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.tax_rate}
                      onChange={(e) => updateItem(index, "tax_rate", Number.parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>€{calculateItemTotal(item).toFixed(2)}</TableCell>
                  <TableCell>
                    {items.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 space-y-2 text-right">
            <div className="flex justify-end space-x-4">
              <span>Subtotal: €{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-end space-x-4">
              <span>IVA: €{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-end space-x-4 text-lg font-bold">
              <span>Total: €{total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          Crear Factura
        </Button>
      </div>
    </form>
  )
}
