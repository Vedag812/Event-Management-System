import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { qrCode, eventId } = await request.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user owns the event
    const { data: event } = await supabase
      .from("events")
      .select("id")
      .eq("id", eventId)
      .eq("created_by", user.id)
      .single()

    if (!event) {
      return NextResponse.json({ error: "Event not found or unauthorized" }, { status: 404 })
    }

    // Find attendee by QR code
    const { data: attendee, error: findError } = await supabase
      .from("attendees")
      .select("*")
      .eq("qr_code", qrCode)
      .eq("event_id", eventId)
      .single()

    if (findError || !attendee) {
      return NextResponse.json({ error: "Invalid QR code" }, { status: 404 })
    }

    // Check if already checked in
    if (attendee.checked_in) {
      return NextResponse.json({ error: "Already checked in", attendee }, { status: 400 })
    }

    // Check in the attendee
    const { data: updatedAttendee, error: updateError } = await supabase
      .from("attendees")
      .update({
        checked_in: true,
        checked_in_at: new Date().toISOString(),
      })
      .eq("id", attendee.id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      message: "Check-in successful",
      attendee: updatedAttendee,
    })
  } catch (error) {
    console.error("Error checking in attendee:", error)
    return NextResponse.json({ error: "Check-in failed" }, { status: 500 })
  }
}
