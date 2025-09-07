"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import type { Event } from "@/lib/types"

interface AttendanceChartProps {
  events: (Event & { attendees?: any[] })[]
}

export function AttendanceChart({ events }: AttendanceChartProps) {
  const totalRegistrations = events.reduce((sum, event) => sum + (event.attendees?.length || 0), 0)
  const totalCheckedIn = events.reduce(
    (sum, event) => sum + (event.attendees?.filter((a: any) => a.checked_in).length || 0),
    0,
  )
  const noShows = totalRegistrations - totalCheckedIn

  const data = [
    { name: "Checked In", value: totalCheckedIn, color: "#10b981" },
    { name: "No Shows", value: noShows, color: "#ef4444" },
  ]

  const COLORS = ["#10b981", "#ef4444"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Overview</CardTitle>
        <CardDescription>Overall check-in vs no-show rates</CardDescription>
      </CardHeader>
      <CardContent>
        {totalRegistrations > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            <div className="text-center">
              <p>No attendance data</p>
              <p className="text-sm">Data will appear after events have attendees</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
