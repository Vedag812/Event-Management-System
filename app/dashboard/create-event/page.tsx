"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function CreateEventPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [location, setLocation] = useState("")
  const [maxAttendees, setMaxAttendees] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError("You must be logged in to create an event")
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.from("events").insert({
        title,
        description: description || null,
        date: new Date(date).toISOString(),
        location,
        max_attendees: maxAttendees ? Number.parseInt(maxAttendees) : null,
        created_by: user.id,
      })

      if (error) throw error

      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to create event")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-900/20 dark:to-purple-900/20">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/50 shadow-2xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg">
              Create New Event
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 transform perspective-1000 hover:rotate-y-2 bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              Event Details
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 font-medium text-lg">
              Fill out the information below to create your event
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-8">
                <div className="grid gap-3">
                  <Label htmlFor="title" className="text-lg font-bold text-slate-700 dark:text-slate-300">Event Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Annual Conference 2024"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg py-3"
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="description" className="text-lg font-bold text-slate-700 dark:text-slate-300">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your event..."
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="text-lg"
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="date" className="text-lg font-bold text-slate-700 dark:text-slate-300">Date & Time *</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="text-lg py-3"
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="location" className="text-lg font-bold text-slate-700 dark:text-slate-300">Location *</Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="Conference Center, 123 Main St"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="text-lg py-3"
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="maxAttendees" className="text-lg font-bold text-slate-700 dark:text-slate-300">Maximum Attendees (Optional)</Label>
                  <Input
                    id="maxAttendees"
                    type="number"
                    placeholder="100"
                    min="1"
                    value={maxAttendees}
                    onChange={(e) => setMaxAttendees(e.target.value)}
                    className="text-lg py-3"
                  />
                </div>

                {error && <p className="text-lg text-red-500 font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">{error}</p>}

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-2xl hover:shadow-3xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg py-3" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Event"}
                  </Button>
                  <Button asChild variant="outline" className="flex-1 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-lg py-3">
                    <Link href="/dashboard">Cancel</Link>
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
