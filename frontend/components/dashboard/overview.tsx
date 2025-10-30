"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"

const data = [
  {
    name: "Jan",
    Financing: 0,
    Repayments: 0,
  },
  {
    name: "Feb",
    Financing: 12500,
    Repayments: 0,
  },
  {
    name: "Mar",
    Financing: 0,
    Repayments: 2083,
  },
  {
    name: "Apr",
    Financing: 0,
    Repayments: 2083,
  },
  {
    name: "May",
    Financing: 0,
    Repayments: 2083,
  },
  {
    name: "Jun",
    Financing: 0,
    Repayments: 2083,
  },
  {
    name: "Jul",
    Financing: 0,
    Repayments: 2083,
  },
  {
    name: "Aug",
    Financing: 0,
    Repayments: 2083,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Financing" fill="#10b981" />
        <Bar dataKey="Repayments" fill="#6366f1" />
      </BarChart>
    </ResponsiveContainer>
  )
}
