"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { useTheme } from "next-themes"

const data = [
  { month: "Ene", revenue: 8500, invoices: 12, contracts: 3 },
  { month: "Feb", revenue: 12200, invoices: 18, contracts: 5 },
  { month: "Mar", revenue: 15700, invoices: 22, contracts: 7 },
  { month: "Abr", revenue: 11400, invoices: 16, contracts: 4 },
  { month: "May", revenue: 18800, invoices: 26, contracts: 8 },
  { month: "Jun", revenue: 22200, invoices: 31, contracts: 9 },
  { month: "Jul", revenue: 19100, invoices: 28, contracts: 6 },
  { month: "Ago", revenue: 16400, invoices: 23, contracts: 5 },
  { month: "Sep", revenue: 21700, invoices: 29, contracts: 8 },
  { month: "Oct", revenue: 25500, invoices: 35, contracts: 11 },
  { month: "Nov", revenue: 28800, invoices: 38, contracts: 12 },
  { month: "Dic", revenue: 31200, invoices: 42, contracts: 14 },
]

export function RevenueChart() {
  const { theme } = useTheme()

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Card className="border-none shadow-lg">
          <CardContent className="p-3">
            <p className="text-sm font-semibold mb-2">{label} 2024</p>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">Facturación:</span> €{payload[0].value.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Facturas: {payload[0].payload.invoices} | Contratos: {payload[0].payload.contracts}
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
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <XAxis
          dataKey="month"
          stroke={theme === "dark" ? "#888888" : "#333333"}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke={theme === "dark" ? "#888888" : "#333333"}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke={theme === "dark" ? "#adfa1d" : "#0ea5e9"}
          strokeWidth={3}
          dot={{ fill: theme === "dark" ? "#adfa1d" : "#0ea5e9", strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: theme === "dark" ? "#adfa1d" : "#0ea5e9", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
