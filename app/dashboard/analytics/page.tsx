import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, TrendingUp, Users, Calendar, Clock } from "lucide-react"
import { EventsChart } from "@/components/events-chart"
import { AttendanceChart } from "@/components/attendance-chart"

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get comprehensive event data
  const { data: events } = await supabase
    .from("events")
    .select(`
      *,
      attendees(
        id,
        checked_in,
        registered_at,
        checked_in_at
      )
    `)
    .eq("created_by", user.id)
    .order("date", { ascending: true })

  // Calculate advanced analytics
  const totalEvents = events?.length || 0
  const totalRegistrations = events?.reduce((sum, event) => sum + (event.attendees?.length || 0), 0) || 0
  const totalCheckedIn =
    events?.reduce((sum, event) => sum + (event.attendees?.filter((a: any) => a.checked_in).length || 0), 0) || 0

  // Calculate average time between registration and check-in
  const checkInTimes =
    events?.flatMap(
      (event) =>
        event.attendees
          ?.filter((a: any) => a.checked_in && a.checked_in_at && a.registered_at)
          .map((a: any) => {
            const regTime = new Date(a.registered_at).getTime()
            const checkTime = new Date(a.checked_in_at).getTime()
            return (checkTime - regTime) / (1000 * 60 * 60 * 24) // days
          }) || [],
    ) || []

  const avgCheckInTime =
    checkInTimes.length > 0 ? checkInTimes.reduce((sum, time) => sum + time, 0) / checkInTimes.length : 0

  // Most popular event
  const mostPopularEvent = events?.reduce(
    (max, event) => ((event.attendees?.length || 0) > (max?.attendees?.length || 0) ? event : max),
    events[0],
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into your event performance</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {totalCheckedIn} of {totalRegistrations} registered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Event Size</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalEvents > 0 ? Math.round(totalRegistrations / totalEvents) : 0}
              </div>
              <p className="text-xs text-muted-foreground">Registrations per event</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Popular Event</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mostPopularEvent?.attendees?.length || 0}</div>
              <p className="text-xs text-muted-foreground truncate">{mostPopularEvent?.title || "No events yet"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Check-in Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgCheckInTime > 0 ? Math.round(avgCheckInTime) : 0}</div>
              <p className="text-xs text-muted-foreground">Days after registration</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <EventsChart events={events || []} />
          <AttendanceChart events={events || []} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Event Performance Summary</CardTitle>
            <CardDescription>Detailed breakdown of each event</CardDescription>
          </CardHeader>
          <CardContent>
            {events && events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => {
                  const attendeeCount = event.attendees?.length || 0
                  const checkedInCount = event.attendees?.filter((a: any) => a.checked_in).length || 0
                  const attendanceRate = attendeeCount > 0 ? Math.round((checkedInCount / attendeeCount) * 100) : 0

                  return (
                    <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(event.date).toLocaleDateString()} • {event.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-semibold">{attendeeCount}</div>
                          <div className="text-gray-600">Registered</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{checkedInCount}</div>
                          <div className="text-gray-600">Checked In</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{attendanceRate}%</div>
                          <div className="text-gray-600">Attendance</div>
                        </div>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/dashboard/events/${event.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No events to analyze</p>
                <p className="text-sm text-gray-500">Create events to see performance analytics</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
