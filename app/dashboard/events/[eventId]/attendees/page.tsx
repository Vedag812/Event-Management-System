import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Mail, QrCode, CheckCircle, Clock } from "lucide-react"
import { QRCodeDisplay } from "@/components/qr-code-display"
import { QRActions } from "@/components/qr-actions"
import { ExportActions } from "@/components/export-actions"

export default async function AttendeesPage({ params }: { params: { eventId: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get event details
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.eventId)
    .eq("created_by", user.id)
    .single()

  if (!event) {
    redirect("/dashboard")
  }

  // Get attendees
  const { data: attendees } = await supabase
    .from("attendees")
    .select("*")
    .eq("event_id", params.eventId)
    .order("registered_at", { ascending: false })

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
          <h1 className="text-2xl font-bold text-gray-900">{event.title} - Attendees</h1>
          <p className="text-gray-600">
            {attendees?.length || 0} registered • {attendees?.filter((a) => a.checked_in).length || 0} checked in
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Registered Attendees</h2>
          <ExportActions eventId={params.eventId} eventTitle={event.title} />
        </div>

        {attendees && attendees.length > 0 ? (
          <div className="grid gap-4">
            {attendees.map((attendee) => (
              <Card key={attendee.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{attendee.name}</h3>
                        <Badge variant={attendee.checked_in ? "default" : "secondary"}>
                          {attendee.checked_in ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Checked In
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              Registered
                            </>
                          )}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Email: {attendee.email}</p>
                        {attendee.phone && <p>Phone: {attendee.phone}</p>}
                        <p>Registered: {new Date(attendee.registered_at).toLocaleString()}</p>
                        {attendee.checked_in_at && (
                          <p>Checked in: {new Date(attendee.checked_in_at).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <QRCodeDisplay value={attendee.qr_code} size={120} />
                        <p className="text-xs text-gray-500 mt-2">QR Code</p>
                      </div>
                      <QRActions qrCode={attendee.qr_code} attendeeId={attendee.id} attendeeName={attendee.name} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No attendees yet</h3>
              <p className="text-gray-600 mb-4">Share your event registration link to get attendees</p>
              <Button asChild>
                <Link href={`/register/${event.id}`}>View Registration Page</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
