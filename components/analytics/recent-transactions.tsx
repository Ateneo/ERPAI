import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Receipt, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react"

const recentTransactions = [
  {
    id: "1",
    type: "invoice",
    client: "Empresa Tecnológica SL",
    description: "Factura INV-2024-089",
    amount: "+€2,450.00",
    status: "paid",
    verifactu: "sent",
    date: "2024-01-20",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    type: "contract",
    client: "Consultoría Financiera SA",
    description: "Contrato de Servicios",
    amount: "€1,800.00",
    status: "signed",
    verifactu: "pending",
    date: "2024-01-19",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    type: "invoice",
    client: "Formación Profesional SL",
    description: "Factura INV-2024-088",
    amount: "+€3,200.00",
    status: "paid",
    verifactu: "sent",
    date: "2024-01-18",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "4",
    type: "invoice",
    client: "Distribuciones Rápidas SL",
    description: "Factura INV-2024-087",
    amount: "+€875.50",
    status: "pending",
    verifactu: "error",
    date: "2024-01-17",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "5",
    type: "contract",
    client: "Servicios Jurídicos Asociados",
    description: "Contrato de Asesoría",
    amount: "€2,100.00",
    status: "draft",
    verifactu: "na",
    date: "2024-01-16",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const statusConfig = {
  paid: { label: "Pagada", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  signed: { label: "Firmado", color: "bg-blue-100 text-blue-800", icon: CheckCircle2 },
  draft: { label: "Borrador", color: "bg-gray-100 text-gray-800", icon: FileText },
}

const verifactuConfig = {
  sent: { label: "Enviado", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  error: { label: "Error", color: "bg-red-100 text-red-800", icon: AlertCircle },
  na: { label: "N/A", color: "bg-gray-100 text-gray-800", icon: FileText },
}

export function RecentTransactions() {
  return (
    <div className="space-y-4">
      {recentTransactions.map((transaction) => {
        const statusConf = statusConfig[transaction.status]
        const verifactuConf = verifactuConfig[transaction.verifactu]
        const StatusIcon = statusConf.icon
        const VerifactuIcon = verifactuConf.icon

        return (
          <Card key={transaction.id} className="p-4">
            <CardContent className="flex items-center p-0">
              <div className="flex items-center space-x-3">
                {transaction.type === "invoice" ? (
                  <Receipt className="h-8 w-8 text-blue-600" />
                ) : (
                  <FileText className="h-8 w-8 text-green-600" />
                )}
                <Avatar className="h-10 w-10">
                  <AvatarImage src={transaction.avatar || "/placeholder.svg"} alt={transaction.client} />
                  <AvatarFallback>{transaction.client.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>

              <div className="ml-4 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium leading-none">{transaction.client}</p>
                  <Badge className={statusConf.color}>{statusConf.label}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{transaction.description}</p>
                {transaction.type === "invoice" && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">Verifactu:</span>
                    <Badge variant="outline" className={verifactuConf.color}>
                      {verifactuConf.label}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="ml-auto text-right">
                <p
                  className={`text-sm font-medium ${
                    transaction.amount.startsWith("+") ? "text-green-500" : "text-blue-500"
                  }`}
                >
                  {transaction.amount}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(transaction.date).toLocaleDateString("es-ES")}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
