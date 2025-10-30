"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"

const data = [
  {
    name: "Jan",
    "Active Loans": 40,
    Repayments: 24,
    Unclaimed: 5,
  },
  {
    name: "Feb",
    "Active Loans": 45,
    Repayments: 28,
    Unclaimed: 7,
  },
  {
    name: "Mar",
    "Active Loans": 55,
    Repayments: 35,
    Unclaimed: 9,
  },
  {
    name: "Apr",
    "Active Loans": 75,
    Repayments: 40,
    Unclaimed: 12,
  },
  {
    name: "May",
    "Active Loans": 100,
    Repayments: 55,
    Unclaimed: 15,
  },
  {
    name: "Jun",
    "Active Loans": 120,
    Repayments: 70,
    Unclaimed: 18,
  },
  {
    name: "Jul",
    "Active Loans": 130,
    Repayments: 85,
    Unclaimed: 20,
  },
  {
    name: "Aug",
    "Active Loans": 142,
    Repayments: 90,
    Unclaimed: 23,
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
        <Bar dataKey="Active Loans" fill="#8884d8" />
        <Bar dataKey="Repayments" fill="#82ca9d" />
        <Bar dataKey="Unclaimed" fill="#ffc658" />
      </BarChart>
    </ResponsiveContainer>
  )
}
