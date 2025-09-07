"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { Event } from "@/lib/types"

interface EventsChartProps {
  events: (Event & { attendees?: any[] })[]
}

export function EventsChart({ events }: EventsChartProps) {
  // Prepare chart data - group events by month
  const chartData = events.reduce(
    (acc, event) => {
      const date = new Date(event.date)
      const monthYear = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })

      const existing = acc.find((item) => item.month === monthYear)
      const registrations = event.attendees?.length || 0
      const checkedIn = event.attendees?.filter((a: any) => a.checked_in).length || 0

      if (existing) {
        existing.events += 1
        existing.registrations += registrations
        existing.checkedIn += checkedIn
      } else {
        acc.push({
          month: monthYear,
          events: 1,
          registrations,
          checkedIn,
        })
      }

      return acc
    },
    [] as Array<{ month: string; events: number; registrations: number; checkedIn: number }>,
  )

  // Sort by date
  chartData.sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Analytics</CardTitle>
        <CardDescription>Registration and attendance trends over time</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="registrations" fill="#3b82f6" name="Registrations" />
              <Bar dataKey="checkedIn" fill="#10b981" name="Checked In" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            <div className="text-center">
              <p>No data available</p>
              <p className="text-sm">Create events to see analytics</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
