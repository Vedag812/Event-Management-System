
"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QRScanner } from "@/components/qr-scanner"
import { ArrowLeft, CheckCircle, XCircle, User, Clock } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import type { Event, Attendee } from "@/lib/types"

// Note: Ensure Attendee type in lib/types.ts has checked_in_at?: string | null if null is intended
// If deploying to Vercel's Edge Runtime, address warnings about Node.js APIs in Supabase libraries.

export default function ScanPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string
  const { toast } = useToast()

  const [event, setEvent] = useState<Event | null>(null)
  const [recentScans, setRecentScans] = useState<(Attendee & { scanResult: "success" | "error" | "duplicate" })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, checkedIn: 0 })

  useEffect(() => {
    fetchEventData()
  }, [eventId])

  const fetchEventData = async () => {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      toast({
        title: "Authentication Error",
        description: "Please log in to continue.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    try {
      // Get event details
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .eq("created_by", user.id)
        .single()

      if (eventError || !eventData) {
        toast({
          title: "Event Not Found",
          description: "You don't have permission to scan for this event.",
          variant: "destructive",
        })
        router.push("/dashboard")
        return
      }

      setEvent(eventData)

      // Get attendee stats
      const { data: attendees, error: attendeesError } = await supabase
        .from("attendees")
        .select("*")
        .eq("event_id", eventId)

      if (attendeesError) {
        throw attendeesError
      }

      if (attendees) {
        setStats({
          total: attendees.length,
          checkedIn: attendees.filter((a: Attendee) => a.checked_in).length,
        })
      }
    } catch (error) {
      console.error("Error fetching event data:", error)
      toast({
        title: "Error",
        description: "Failed to load event data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleScan = async (qrCode: string) => {
    const supabase = createClient()

    try {
      // Find attendee by QR code
      const { data: attendee, error: findError } = await supabase
        .from("attendees")
        .select("*")
        .eq("qr_code", qrCode)
        .eq("event_id", eventId)
        .single()

      if (findError || !attendee) {
        const errorResult: Attendee & { scanResult: "error" } = {
          id: `error-${Date.now()}`,
          name: "Unknown",
          email: "",
          qr_code: qrCode,
          checked_in: false,
          scanResult: "error",
          event_id: eventId,
          phone: undefined,
          checked_in_at: undefined, // Changed from null to undefined to match string | undefined
          registered_at: new Date().toISOString(),
        }
        setRecentScans((prev) => [errorResult, ...prev.slice(0, 9)])

        toast({
          title: "Invalid QR Code",
          description: "This QR code is not valid for this event.",
          variant: "destructive",
        })
        return
      }

      // Check if already checked in
      if (attendee.checked_in) {
        const duplicateResult: Attendee & { scanResult: "duplicate" } = {
          ...attendee,
          scanResult: "duplicate",
        }
        setRecentScans((prev) => [duplicateResult, ...prev.slice(0, 9)])
        toast({
          title: "Already Checked In",
          description: `${attendee.name} was already checked in.`,
          variant: "destructive",
        })
        return
      }

      // Check in the attendee
      const { error: updateError } = await supabase
        .from("attendees")
        .update({
          checked_in: true,
          checked_in_at: new Date().toISOString(),
        })
        .eq("id", attendee.id)

      if (updateError) {
        throw updateError
      }

      // Success
      const successResult: Attendee & { scanResult: "success" } = {
        ...attendee,
        checked_in: true,
        checked_in_at: new Date().toISOString(),
        scanResult: "success",
      }
      setRecentScans((prev) => [successResult, ...prev.slice(0, 9)])
      setStats((prev) => ({ ...prev, checkedIn: prev.checkedIn + 1 }))

      toast({
        title: "Check-in Successful",
        description: `${attendee.name} has been checked in.`,
      })
    } catch (error) {
      console.error("Error processing scan:", error)
      toast({
        title: "Check-in Failed",
        description: "An error occurred while checking in the attendee.",
        variant: "destructive",
      })
    }
  }

  const handleScanError = (error: string) => {
    toast({
      title: "Scanner Error",
      description: error,
      variant: "destructive",
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading scanner...</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Event Not Found</CardTitle>
            <CardDescription>You don't have permission to scan for this event.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-2">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/dashboard/events/${eventId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Event
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{event.title} - Scanner</h1>
          <p className="text-gray-600">
            {stats.checkedIn} of {stats.total} attendees checked in
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <QRScanner onScan={handleScan} onError={handleScanError} />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Check-in Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.checkedIn}</div>
                    <div className="text-sm text-gray-600">Checked In</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">{stats.total - stats.checkedIn}</div>
                    <div className="text-sm text-gray-600">Remaining</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats.total > 0 ? (stats.checkedIn / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0}% attendance
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Scans</CardTitle>
                <CardDescription>Latest check-in attempts</CardDescription>
              </CardHeader>
              <CardContent>
                {recentScans.length > 0 ? (
                  <div className="space-y-3">
                    {recentScans.map((scan, index) => (
                      <div
                        key={`${scan.id}-${index}`}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {scan.scanResult === "success" ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <div>
                            <p className="font-medium">{scan.name}</p>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date().toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            scan.scanResult === "success"
                              ? "default"
                              : scan.scanResult === "duplicate"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {scan.scanResult === "success"
                            ? "Checked In"
                            : scan.scanResult === "duplicate"
                              ? "Already In"
                              : "Invalid"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No scans yet</p>
                    <p className="text-sm text-gray-500">Start scanning QR codes to check in attendees</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
