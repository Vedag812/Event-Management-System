import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Users, QrCode, BarChart3, CheckCircle, Clock, Mail, Download, Smartphone, Shield, Zap } from "lucide-react"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  // Get upcoming public events
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .gte("date", new Date().toISOString())
    .order("date", { ascending: true })
    .limit(6)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-900/20 dark:to-purple-900/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            The Future of Event Management
          </div>
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 leading-tight">
            EventFlow Pro
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your events with AI-powered attendance tracking, seamless QR check-ins, and real-time analytics. 
            The ultimate platform for modern event organizers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className="transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-2xl hover:shadow-3xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg px-8 py-4">
              <Link href="/auth/sign-up">Start Free Trial</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl text-lg px-8 py-4">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-slate-500 dark:text-slate-400 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-500" />
              <span>Setup in 2 Minutes</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 transform perspective-1000 hover:rotate-y-2 bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
            <CardHeader>
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg w-fit mb-4">
                <QrCode className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-slate-700 dark:text-slate-300">Smart QR Check-ins</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Generate unique QR codes for instant, contactless check-ins. Works on any smartphone with our built-in scanner.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 transform perspective-1000 hover:rotate-y-2 bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
            <CardHeader>
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg w-fit mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-slate-700 dark:text-slate-300">Attendee Management</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Track registrations, manage attendee information, monitor capacity, and send automated confirmation emails.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 transform perspective-1000 hover:rotate-y-2 bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
            <CardHeader>
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg w-fit mb-4">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-slate-700 dark:text-slate-300">Real-time Analytics</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Get instant insights with live attendance data, export reports to Excel, and track event performance metrics.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 transform perspective-1000 hover:rotate-y-2 bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
            <CardHeader>
              <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg w-fit mb-4">
                <CalendarDays className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-slate-700 dark:text-slate-300">Event Management</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Create, edit, and manage multiple events with detailed information, capacity limits, and automated workflows.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 transform perspective-1000 hover:rotate-y-2 bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
            <CardHeader>
              <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg w-fit mb-4">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-slate-700 dark:text-slate-300">Automated Emails</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Send confirmation emails with QR codes, bulk notifications, and custom email templates for your events.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 transform perspective-1000 hover:rotate-y-2 bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
            <CardHeader>
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg w-fit mb-4">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-slate-700 dark:text-slate-300">Mobile Optimized</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Fully responsive design works perfectly on all devices. Check-in attendees using any smartphone or tablet.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* How It Works Section */}
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent mb-4">
            How It Works
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
            Get started in minutes with our simple 3-step process
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Create Your Event</h3>
              <p className="text-slate-600 dark:text-slate-400">Set up your event details, capacity, and registration settings in just a few clicks.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Share Registration</h3>
              <p className="text-slate-600 dark:text-slate-400">Send the registration link to attendees. They'll receive QR codes via email automatically.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 shadow-2xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Track Attendance</h3>
              <p className="text-slate-600 dark:text-slate-400">Scan QR codes at check-in and monitor real-time attendance with detailed analytics.</p>
            </div>
          </div>
        </div>

        {/* Upcoming Events Section */}
        {events && events.length > 0 && (
          <div className="mb-20">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent mb-4 text-center">
              Upcoming Events
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-12 text-center max-w-2xl mx-auto">
              Join these exciting events and experience EventFlow Pro in action
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <Card key={event.id} className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 transform perspective-1000 hover:rotate-y-2 bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-slate-700 dark:text-slate-300">{event.title}</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} • {event.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 line-clamp-2">{event.description}</p>
                    <Button asChild className="w-full transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                      <Link href={`/register/${event.id}`}>Register Now</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Events?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of event organizers who trust EventFlow Pro</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-2xl text-lg px-8 py-4">
              <Link href="/auth/sign-up">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10 transform hover:scale-105 transition-all duration-300 shadow-lg text-lg px-8 py-4">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}