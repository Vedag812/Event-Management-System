import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QRCodeDisplay } from "@/components/qr-code-display"
import { CalendarDays, MapPin, User, Mail, Phone } from "lucide-react"

export default async function QRCodePage({ params }: { params: { qrCode: string } }) {
  const supabase = await createClient()

  // Get attendee and event details
  const { data: attendee } = await supabase
    .from("attendees")
    .select(`
      *,
      events (
        title,
        date,
        location,
        description
      )
    `)
    .eq("qr_code", params.qrCode)
    .single()

  if (!attendee) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card>
          <CardHeader>
            <CardTitle>QR Code Not Found</CardTitle>
            <CardDescription>This QR code is not valid or has expired.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const event = attendee.events

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="container mx-auto max-w-2xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Event Ticket</CardTitle>
            <CardDescription className="text-center">Present this QR code at the event for check-in</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center mb-6">
              <QRCodeDisplay value={attendee.qr_code} size={200} />
            </div>
            <div className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded">{attendee.qr_code}</div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{event.title}</CardTitle>
            <CardDescription className="flex items-center gap-4 text-base">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                {new Date(event.date).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {event.location}
              </span>
            </CardDescription>
          </CardHeader>
          {event.description && (
            <CardContent>
              <p className="text-gray-600">{event.description}</p>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendee Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span>{attendee.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span>{attendee.email}</span>
            </div>
            {attendee.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{attendee.phone}</span>
              </div>
            )}
            <div className="text-sm text-gray-500">Registered: {new Date(attendee.registered_at).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
