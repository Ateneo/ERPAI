"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, Plus, Send, CreditCard, MoreHorizontal } from "lucide-react"
import { AddMoneyModal } from "./add-money-modal"
import { SendMoneyModal } from "./send-money-modal"
import { RequestMoneyModal } from "./request-money-modal"

const initialAccounts = [
  { name: "Cuenta Corriente", balance: 7500 },
  { name: "Ahorros", balance: 560000 },
  { name: "Inversión", balance: 5879000 },
]

export function AccountsOverview() {
  const [accounts, setAccounts] = useState(initialAccounts)
  const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false)
  const [isSendMoneyModalOpen, setIsSendMoneyModalOpen] = useState(false)
  const [isRequestMoneyModalOpen, setIsRequestMoneyModalOpen] = useState(false)

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

  const handleAddMoney = (amount) => {
    setAccounts(
      accounts.map((account) =>
        account.name === "Cuenta Corriente" ? { ...account, balance: account.balance + amount } : account,
      ),
    )
  }

  const handleSendMoney = (amount, fromAccount) => {
    setAccounts(
      accounts.map((account) =>
        account.name === fromAccount ? { ...account, balance: account.balance - amount } : account,
      ),
    )
  }

  const handleRequestMoney = (amount, contact) => {
    console.log(`Solicitado €${amount} de ${contact.name}`)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Resumen de Cuentas</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">€{totalBalance.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">Saldo total en todas las cuentas</p>
        <div className="mt-4 space-y-2">
          {accounts.map((account) => (
            <div key={account.name} className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{account.name}</span>
              <span className="text-sm font-medium">€{account.balance.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button size="sm" onClick={() => setIsAddMoneyModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Añadir
          </Button>
          <Button size="sm" onClick={() => setIsSendMoneyModalOpen(true)}>
            <Send className="mr-2 h-4 w-4" /> Enviar
          </Button>
          <Button size="sm" onClick={() => setIsRequestMoneyModalOpen(true)}>
            <CreditCard className="mr-2 h-4 w-4" /> Solicitar
          </Button>
          <Button size="sm" variant="outline">
            <MoreHorizontal className="mr-2 h-4 w-4" /> Más
          </Button>
        </div>
      </CardContent>
      <AddMoneyModal
        isOpen={isAddMoneyModalOpen}
        onClose={() => setIsAddMoneyModalOpen(false)}
        onAddMoney={handleAddMoney}
      />
      <SendMoneyModal
        isOpen={isSendMoneyModalOpen}
        onClose={() => setIsSendMoneyModalOpen(false)}
        onSendMoney={handleSendMoney}
        accounts={accounts}
      />
      <RequestMoneyModal
        isOpen={isRequestMoneyModalOpen}
        onClose={() => setIsRequestMoneyModalOpen(false)}
        onRequestMoney={handleRequestMoney}
      />
    </Card>
  )
}
