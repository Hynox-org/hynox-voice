"use client"

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

interface DataVisualizationProps {
  type: "pie" | "bar" | "line" // Add other chart types as needed
  data: any[]
  config: any // Chart configuration for ChartContainer
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#FF1919",
]

export function DataVisualization({ type, data, config }: DataVisualizationProps) {
  if (!data || data.length === 0) return null

  const nameKey = Object.keys(data[0])[0]
  const dataKey = Object.keys(data[0])[1]

  let chartComponent = null

  switch (type) {
    case "pie":
      chartComponent = (
        <PieChart>
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
          <ChartTooltip />
          <ChartLegend />
        </PieChart>
      )
      break
    case "bar":
      chartComponent = (
        <BarChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey={nameKey}
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <YAxis />
          <ChartTooltip />
          <ChartLegend />
          <Bar
            dataKey={dataKey}
            fill="var(--color-primary)"
            radius={4}
          />
        </BarChart>
      )
      break
    default:
      chartComponent = null
  }

  if (!chartComponent) {
    return null
  }

  return (
    <ChartContainer config={config} className="min-h-[200px] w-full">
      {chartComponent}
    </ChartContainer>
  )
}
