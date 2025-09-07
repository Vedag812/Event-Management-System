"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, CheckCircle, Clock } from "lucide-react"
import { useEffect, useState } from "react"

interface ActivityItem {
  id: string
  name?: string
  email: string
  event_title: string
  type: "registration" | "checkin"
  registered_at?: string
  checked_in_at?: string
}

interface RecentActivityProps {
  registrations: ActivityItem[]
  checkIns: ActivityItem[]
}

// Client-side date component to prevent hydration mismatches
function ClientDate({ timestamp }: { timestamp: string }) {
  const [formattedDate, setFormattedDate] = useState<string>("")

  useEffect(() => {
    if (timestamp) {
      setFormattedDate(new Date(timestamp).toLocaleString())
    }
  }, [timestamp])

  return <span>{formattedDate}</span>
}

export function RecentActivity({ registrations, checkIns }: RecentActivityProps) {
  // Combine and sort all activities
  const allActivities = [
    ...registrations.map((item) => ({
      ...item,
      timestamp: item.registered_at || "",
      action: "registered for",
    })),
    ...checkIns.map((item) => ({
      ...item,
      timestamp: item.checked_in_at || "",
      action: "checked in to",
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest registrations and check-ins</CardDescription>
      </CardHeader>
      <CardContent>
        {allActivities.length > 0 ? (
          <div className="space-y-4">
            {allActivities.map((activity, index) => (
              <div key={`${activity.id}-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {activity.type === "registration" ? (
                    <Users className="h-5 w-5 text-blue-600" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{activity.name || activity.email}</p>
                  <p className="text-sm text-gray-600 truncate">
                    {activity.action} {activity.event_title}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <ClientDate timestamp={activity.timestamp} />
                  </p>
                </div>
                <Badge variant={activity.type === "registration" ? "secondary" : "default"}>
                  {activity.type === "registration" ? "Registered" : "Checked In"}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No recent activity</p>
            <p className="text-sm text-gray-500">Activity will appear here as people register and check in</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
