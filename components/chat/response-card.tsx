"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { DataVisualization } from "./data-visualization"

// Define the structure of the Flask API response
export type ApiResponse = {
  status: "success" | "conversational" | "error"
  summary: string
  data: {
    type: string
    data: any[]
  } | null
  table: {
    columns: string[]
    rows: Record<string, any>[]
  } | null
  error: string | null
}

interface ResponseCardProps {
  response: ApiResponse
}

export function ResponseCard({ response }: ResponseCardProps) {
  if (!response) return null

  switch (response.status) {
    case "success":
      return (
        <Card className="w-full max-w-2xl mx-auto my-4 shadow-lg">
          <CardContent className="space-y-6">
            {response.data && response.data.type === "bar" && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Chart</h3>
                <div className="flex justify-center">
                  <DataVisualization type="bar" data={response.data.data} config={{}} />
                </div>
              </div>
            )}
            {response.data && response.data.type === "pie" && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Pie Chart</h3>
                <div className="flex justify-center">
                  <DataVisualization type="pie" data={response.data.data} config={{}} />
                </div>
              </div>
            )}
            {response.table && (
              <div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {response.table?.columns.map((col) => (
                          <TableHead key={col}>{col}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {response.table?.rows.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {response.table?.columns.map((col) => (
                            <TableCell key={col}>{row[col]}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )
    case "error":
      return (
        <Card className="w-full max-w-2xl mx-auto my-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 shadow-lg">
          <CardContent>
            <p className="text-sm text-red-700 dark:text-red-400">{response.error}</p>
          </CardContent>
        </Card>
      )
    default:
      return null
  }
}
