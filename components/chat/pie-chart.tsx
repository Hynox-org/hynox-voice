"use client"

import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts"

interface PieChartProps {
  data: any[]
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#FF1919",
]

export function PieChartComponent({ data }: PieChartProps) {
  if (!data || data.length === 0) return null

  const nameKey = Object.keys(data[0])[0]
  const dataKey = Object.keys(data[0])[1]

  return (
    <PieChart width={400} height={400}>
      <Pie
        data={data}
        cx={200}
        cy={200}
        labelLine={false}
        outerRadius={80}
        fill="#8884d8"
        dataKey={dataKey}
        nameKey={nameKey}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  )
}
