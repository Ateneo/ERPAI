"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { useTheme } from "next-themes"

const data = [
  { month: "Ene", newClients: 8, totalClients: 98, contracts: 3 },
  { month: "Feb", newClients: 12, totalClients: 110, contracts: 5 },
  { month: "Mar", newClients: 15, totalClients: 125, contracts: 7 },
  { month: "Abr", newClients: 9, totalClients: 134, contracts: 4 },
  { month: "May", newClients: 11, totalClients: 145, contracts: 8 },
  { month: "Jun", newClients: 14, totalClients: 159, contracts: 9 },
]

export function AccountGrowth() {
  const { theme } = useTheme()

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Card className="border-none shadow-lg">
          <CardContent className="p-3">
            <p className="text-sm font-semibold mb-2">{label} 2024</p>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">Nuevos Clientes:</span> {payload[0].value}
              </p>
              <p className="text-sm">
                <span className="font-medium">Total Clientes:</span> {payload[1].value}
              </p>
              <p className="text-sm">
                <span className="font-medium">Contratos:</span> {payload[0].payload.contracts}
              </p>
            </div>
          </CardContent>
        </Card>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <XAxis
          dataKey="month"
          stroke={theme === "dark" ? "#888888" : "#333333"}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis stroke={theme === "dark" ? "#888888" : "#333333"} fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar
          dataKey="newClients"
          name="Nuevos Clientes"
          fill={theme === "dark" ? "#adfa1d" : "#0ea5e9"}
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="contracts"
          name="Contratos"
          fill={theme === "dark" ? "#1e40af" : "#3b82f6"}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
