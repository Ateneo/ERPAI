"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, SendHorizontal, CreditCard } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function ActionDialog({ title, description, actionText }: { title: string; description: string; actionText: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {title === "Add Funds" && <PlusCircle className="mr-2 h-4 w-4" />}
          {title === "Send Money" && <SendHorizontal className="mr-2 h-4 w-4" />}
          {title === "Top Up" && <CreditCard className="mr-2 h-4 w-4" />}
          {title}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Cantidad
            </Label>
            <Input id="amount" type="number" placeholder="Introducir cantidad" className="col-span-3" />
          </div>
        </div>
        <Button type="submit">{actionText}</Button>
      </DialogContent>
    </Dialog>
  )
}

export function QuickActions() {
  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <ActionDialog title="Añadir Fondos" description="Añadir fondos a tu cuenta" actionText="Añadir Fondos" />
        <ActionDialog title="Enviar Dinero" description="Enviar dinero a otra cuenta" actionText="Enviar Dinero" />
        <ActionDialog title="Recargar" description="Recargar tu cuenta" actionText="Recargar" />
      </CardContent>
    </Card>
  )
}
