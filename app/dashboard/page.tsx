import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Calendar, Users, QrCode, TrendingUp, CheckCircle } from "lucide-react"
import { EventsChart } from "@/components/events-chart"
import { RecentActivity } from "@/components/recent-activity"
import { EventCountdown } from "@/components/event-countdown"
import { SuspenseWrapper, CardSuspenseWrapper } from "@/components/suspense-wrapper"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user's events with attendee counts and check-in stats
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

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Calculate dashboard statistics
  const totalEvents = events?.length || 0
  const totalRegistrations = events?.reduce((sum, event) => sum + (event.attendees?.length || 0), 0) || 0
  const totalCheckedIn =
    events?.reduce((sum, event) => sum + (event.attendees?.filter((a: any) => a.checked_in).length || 0), 0) || 0
  const upcomingEvents = events?.filter((event) => new Date(event.date) > new Date()).length || 0

  // Get recent activity (last 10 registrations and check-ins)
  const recentRegistrations =
    events
      ?.flatMap(
        (event) =>
          event.attendees?.map((attendee: any) => ({
            ...attendee,
            event_title: event.title,
            type: "registration",
          })) || [],
      )
      .sort((a, b) => new Date(b.registered_at).getTime() - new Date(a.registered_at).getTime())
      .slice(0, 5) || []

  const recentCheckIns =
    events
      ?.flatMap(
        (event) =>
          event.attendees
            ?.filter((attendee: any) => attendee.checked_in && attendee.checked_in_at)
            .map((attendee: any) => ({
              ...attendee,
              event_title: event.title,
              type: "checkin",
            })) || [],
      )
      .sort((a, b) => new Date(b.checked_in_at).getTime() - new Date(a.checked_in_at).getTime())
      .slice(0, 5) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-900/20 dark:to-purple-900/20">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/50 shadow-2xl">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="transform hover:scale-105 transition-transform duration-300">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg">
              Admin Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1 font-medium">
              Welcome back, {profile?.full_name || user.email}
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild className="transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl">
              <Link href="/dashboard/create-event">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Link>
            </Button>
            <form action="/auth/signout" method="post">
              <Button variant="outline" type="submit" className="transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 transform perspective-1000 hover:rotate-y-2 bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Events</CardTitle>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-300">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{totalEvents}</div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{upcomingEvents} upcoming</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 transform perspective-1000 hover:rotate-y-2 bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Registrations</CardTitle>
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-300">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{totalRegistrations}</div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Across all events</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 transform perspective-1000 hover:rotate-y-2 bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Check-ins</CardTitle>
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-300">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{totalCheckedIn}</div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                {totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0}% attendance rate
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 transform perspective-1000 hover:rotate-y-2 bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Avg. Attendance</CardTitle>
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-300">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {totalEvents > 0 ? Math.round(totalRegistrations / totalEvents) : 0}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Per event</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <CardSuspenseWrapper>
            <EventsChart events={events || []} />
          </CardSuspenseWrapper>
          <CardSuspenseWrapper>
            <RecentActivity registrations={recentRegistrations} checkIns={recentCheckIns} />
          </CardSuspenseWrapper>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
            Your Events
          </h2>
          <div className="flex gap-3">
            <Button asChild variant="outline" className="transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl">
              <Link href="/dashboard/analytics">View Analytics</Link>
            </Button>
            <Button asChild variant="outline" className="transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl">
              <Link href="/dashboard/create-event">Create New Event</Link>
            </Button>
          </div>
        </div>

        {events && events.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => {
              const attendeeCount = event.attendees?.length || 0
              const checkedInCount = event.attendees?.filter((a: any) => a.checked_in).length || 0
              const isUpcoming = new Date(event.date) > new Date()

              return (
                <Card key={event.id} className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 transform perspective-1000 hover:rotate-y-2 bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                        {event.title}
                      </CardTitle>
                      <div
                        className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg transform transition-all duration-300 ${
                          isUpcoming 
                            ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-emerald-500/25" 
                            : "bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-slate-500/25"
                        }`}
                      >
                        {isUpcoming ? "Upcoming" : "Past"}
                      </div>
                    </div>
                    <CardDescription className="text-slate-600 dark:text-slate-400 font-medium">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })} • {event.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isUpcoming && (
                      <div className="mb-6">
                        <EventCountdown eventDate={event.date} size="sm" />
                      </div>
                    )}
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Registrations</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {attendeeCount}
                          {event.max_attendees ? ` / ${event.max_attendees}` : ""}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Checked In</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {checkedInCount} ({attendeeCount > 0 ? Math.round((checkedInCount / attendeeCount) * 100) : 0}
                          %)
                        </span>
                      </div>
                      {attendeeCount > 0 && (
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 shadow-inner">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-lg"
                            style={{ width: `${(checkedInCount / attendeeCount) * 100}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Button asChild size="sm" className="flex-1 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                        <Link href={`/dashboard/events/${event.id}`}>Manage</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="flex-1 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                        <Link href={`/scan/${event.id}`}>
                          <QrCode className="h-3 w-3 mr-1" />
                          Scan
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border-white/20 dark:border-slate-700/50 shadow-2xl">
            <CardContent className="text-center py-16">
              <div className="p-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl mx-auto mb-6 w-fit transform hover:scale-110 transition-transform duration-300">
                <Calendar className="h-16 w-16 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                No events yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg font-medium">
                Create your first event to get started with event management
              </p>
              <Button asChild className="transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-2xl hover:shadow-3xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg px-8 py-3">
                <Link href="/dashboard/create-event">Create Event</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
