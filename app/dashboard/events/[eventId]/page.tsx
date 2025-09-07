import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, QrCode, Calendar, MapPin, Share2 } from "lucide-react"
import { EditEventDialog } from "@/components/edit-event-dialog"
import { EventCountdown } from "@/components/event-countdown"

export default async function EventDetailsPage({ params }: { params: { eventId: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get event details with attendee count
  const { data: event } = await supabase
    .from("events")
    .select(`
      *,
      attendees(count)
    `)
    .eq("id", params.eventId)
    .eq("created_by", user.id)
    .single()

  if (!event) {
    redirect("/dashboard")
  }

  const attendeeCount = event.attendees?.[0]?.count || 0
  const checkedInCount = 0 // We'll implement this in the scanner functionality

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-900/20 dark:to-purple-900/20">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/50 shadow-2xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button asChild variant="ghost" size="sm" className="transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <div className="flex justify-between items-start">
            <div className="transform hover:scale-105 transition-transform duration-300">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg">
                {event.title}
              </h1>
              <div className="flex items-center gap-6 text-slate-600 dark:text-slate-300 mt-3">
                <span className="flex items-center gap-2 font-medium">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  {new Date(event.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className="flex items-center gap-2 font-medium">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  {event.location}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <EditEventDialog event={event} />
              <Button variant="outline" className="transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 transform perspective-1000 hover:rotate-y-2 bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Registrations</CardTitle>
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-300">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{attendeeCount}</div>
              {event.max_attendees && <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">of {event.max_attendees} max</p>}
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 transform perspective-1000 hover:rotate-y-2 bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Checked In</CardTitle>
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-300">
                <QrCode className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{checkedInCount}</div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                {attendeeCount > 0 ? Math.round((checkedInCount / attendeeCount) * 100) : 0}% attendance
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 transform perspective-1000 hover:rotate-y-2 bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Event Status</CardTitle>
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-300">
                <div className="h-5 w-5 rounded-full bg-white/20"></div>
              </div>
            </CardHeader>
            <CardContent>
              <Badge className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg transform transition-all duration-300 ${
                new Date(event.date) > new Date() 
                  ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-emerald-500/25" 
                  : "bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-slate-500/25"
              }`}>
                {new Date(event.date) > new Date() ? "Upcoming" : "Past"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 transform perspective-1000 hover:rotate-y-2 bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {new Date(event.date) > new Date() && (
                <div className="mb-6">
                  <EventCountdown eventDate={event.date} eventTitle={event.title} size="md" showTitle={false} />
                </div>
              )}
              {event.description && (
                <div>
                  <h4 className="font-bold mb-3 text-slate-700 dark:text-slate-300">Description</h4>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">{event.description}</p>
                </div>
              )}
              <div>
                <h4 className="font-bold mb-3 text-slate-700 dark:text-slate-300">Date & Time</h4>
                <p className="text-slate-600 dark:text-slate-400 font-medium">{new Date(event.date).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}</p>
              </div>
              <div>
                <h4 className="font-bold mb-3 text-slate-700 dark:text-slate-300">Location</h4>
                <p className="text-slate-600 dark:text-slate-400 font-medium">{event.location}</p>
              </div>
              {event.max_attendees && (
                <div>
                  <h4 className="font-bold mb-3 text-slate-700 dark:text-slate-300">Capacity</h4>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">{event.max_attendees} attendees</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 transform perspective-1000 hover:rotate-y-2 bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                Quick Actions
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 font-medium">Manage your event and attendees</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full justify-start transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <Link href={`/dashboard/events/${event.id}/attendees`}>
                  <Users className="h-4 w-4 mr-2" />
                  View Attendees ({attendeeCount})
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                <Link href={`/scan/${event.id}`}>
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Code Scanner
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                <Link href={`/register/${event.id}`}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Registration Page
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
