"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarDays, MapPin, Users } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import type { Event } from "@/lib/types"
import { EventCountdown } from "@/components/event-countdown"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function RegisterPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string

  const [event, setEvent] = useState<Event | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingEvent, setLoadingEvent] = useState(true)

  useEffect(() => {
    const fetchEvent = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from("events").select("*").eq("id", eventId).single()

      if (error) {
        setError("Event not found")
      } else {
        setEvent(data)
      }
      setLoadingEvent(false)
    }

    fetchEvent()
  }, [eventId])

  const generateQRCode = () => {
    return `${eventId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const qrCode = generateQRCode()

    try {
      const { error } = await supabase.from("attendees").insert({
        event_id: eventId,
        name,
        email,
        phone: phone || null,
        qr_code: qrCode,
      })

      if (error) {
        if (error.code === "23505") {
          throw new Error("You are already registered for this event")
        }
        throw error
      }

      // Automatically send QR code email after successful registration (public endpoint)
      try {
        const emailResponse = await fetch("/api/send-qr-email-public", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventId,
            attendeeEmail: email,
            attendeeName: name,
            qrCode,
          }),
        })

        if (!emailResponse.ok) {
          console.warn("Failed to send QR code email, but registration was successful")
        }
      } catch (emailError) {
        console.warn("Email sending failed, but registration was successful:", emailError)
      }

      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingEvent) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-900/20 dark:to-purple-900/20">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            EventFlow Pro
          </h1>
          <LoadingSpinner size="xl" text="Loading event details..." />
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Event Not Found</CardTitle>
            <CardDescription>The event you&apos;re looking for doesn&apos;t exist.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-900/20 dark:to-purple-900/20">
        <Card className="w-full max-w-lg group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 transform perspective-1000 hover:rotate-y-2 bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
          <CardHeader className="text-center">
            <div className="p-6 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 shadow-2xl mx-auto mb-6 w-fit transform hover:scale-110 transition-transform duration-300">
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-4xl">🎉</span>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Registration Successful!
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 font-medium text-lg mt-2">
              You&apos;ve been registered for {event.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 font-medium">
              A confirmation email with your QR code has been sent to <strong className="text-indigo-600 dark:text-indigo-400">{email}</strong>. 
              Please check your inbox and bring the QR code to the event for check-in.
            </p>
            <Button onClick={() => router.push("/")} className="w-full transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-2xl hover:shadow-3xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg py-3">
              Back to Events
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-900/20 dark:to-purple-900/20 p-6">
      <div className="container mx-auto max-w-2xl">
        <Card className="mb-8 group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 transform perspective-1000 hover:rotate-y-2 bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg">
              {event.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-6 text-lg mt-4">
              <span className="flex items-center gap-2 font-medium text-slate-600 dark:text-slate-300">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                  <CalendarDays className="h-4 w-4 text-white" />
                </div>
                {new Date(event.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-2 font-medium text-slate-600 dark:text-slate-300">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                {event.location}
              </span>
              {event.max_attendees && (
                <span className="flex items-center gap-2 font-medium text-slate-600 dark:text-slate-300">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  Max {event.max_attendees}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {new Date(event.date) > new Date() && (
              <div className="mb-6">
                <EventCountdown eventDate={event.date} eventTitle={event.title} size="lg" showTitle={false} />
              </div>
            )}
            {event.description && (
              <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">{event.description}</p>
            )}
          </CardContent>
        </Card>

        <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 transform perspective-1000 hover:rotate-y-2 bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              Register for Event
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 font-medium text-lg">
              Fill out the form below to register for this event
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="name" className="text-lg font-bold text-slate-700 dark:text-slate-300">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-lg py-3"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="email" className="text-lg font-bold text-slate-700 dark:text-slate-300">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-lg py-3"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="phone" className="text-lg font-bold text-slate-700 dark:text-slate-300">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="text-lg py-3"
                  />
                </div>
                {error && <p className="text-lg text-red-500 font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">{error}</p>}
                <Button type="submit" className="w-full transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-2xl hover:shadow-3xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg py-3" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      <span>Registering...</span>
                    </div>
                  ) : (
                    "Register for Event"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
