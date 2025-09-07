import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .eq("created_by", user.id)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Get all attendees for the event
    const { data: attendees, error: attendeesError } = await supabase
      .from("attendees")
      .select("*")
      .eq("event_id", eventId)
      .order("registered_at", { ascending: false })

    if (attendeesError) {
      return NextResponse.json({ error: "Failed to fetch attendees" }, { status: 500 })
    }

    // Create CSV content
    const headers = [
      "Name",
      "Email", 
      "Phone",
      "QR Code",
      "Registration Date",
      "Check-in Status",
      "Check-in Date"
    ]

    const csvRows = [
      headers.join(","),
      ...(attendees || []).map(attendee => [
        `"${attendee.name || ""}"`,
        `"${attendee.email || ""}"`,
        `"${attendee.phone || ""}"`,
        `"${attendee.qr_code || ""}"`,
        `"${attendee.registered_at ? new Date(attendee.registered_at).toLocaleString() : ""}"`,
        `"${attendee.checked_in ? "Yes" : "No"}"`,
        `"${attendee.checked_in_at ? new Date(attendee.checked_in_at).toLocaleString() : ""}"`
      ].join(","))
    ]

    const csvContent = csvRows.join("\n")

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_attendees.csv"`
      }
    })

  } catch (error) {
    console.error("Error exporting CSV:", error)
    return NextResponse.json({ error: "Failed to export CSV" }, { status: 500 })
  }
}
