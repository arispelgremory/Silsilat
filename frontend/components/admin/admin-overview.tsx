"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "@/components/ui/chart"

const tokenData = [
  { name: "Jan", minted: 45, burned: 12, listed: 38 },
  { name: "Feb", minted: 52, burned: 18, listed: 45 },
  { name: "Mar", minted: 68, burned: 25, listed: 58 },
  { name: "Apr", minted: 85, burned: 32, listed: 72 },
  { name: "May", minted: 95, burned: 28, listed: 88 },
  { name: "Jun", minted: 110, burned: 45, listed: 95 },
  { name: "Jul", minted: 125, burned: 38, listed: 108 },
  { name: "Aug", minted: 142, burned: 52, listed: 125 },
]

const branchData = [
  { name: "KL Central", volume: 450000, count: 25 },
  { name: "Selangor", volume: 380000, count: 22 },
  { name: "Penang", volume: 320000, count: 18 },
  { name: "Johor", volume: 280000, count: 15 },
  { name: "Perak", volume: 220000, count: 12 },
  { name: "Others", volume: 350000, count: 28 },
]

export function AdminOverview() {
  return (
    <div className="space-y-6">
      {/* Token Activity Chart */}
      <div>
        <h4 className="text-sm font-medium mb-3 text-gray-700">Token Mints/Burns Over Time</h4>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={tokenData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="minted"
              stackId="1"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.6}
              name="Tokens Minted"
            />
            <Area
              type="monotone"
              dataKey="listed"
              stackId="1"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
              name="SAGs Listed"
            />
            <Area
              type="monotone"
              dataKey="burned"
              stackId="1"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.6}
              name="Tokens Burned"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Branch Performance Chart */}
      <div>
        <h4 className="text-sm font-medium mb-3 text-gray-700">Branch Listing Volume</h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={branchData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" stroke="#666" />
            <YAxis dataKey="name" type="category" stroke="#666" width={80} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value, name) => [
                name === "volume" ? `RM ${value.toLocaleString()}` : value,
                name === "volume" ? "Total Volume" : "SAG Count",
              ]}
            />
            <Bar dataKey="volume" fill="#f59e0b" name="Volume (RM)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
