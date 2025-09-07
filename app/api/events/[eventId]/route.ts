import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// Update event
export async function PUT(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, date, location, max_attendees } = body

    // Verify the event belongs to the user
    const { data: event, error: fetchError } = await supabase
      .from("events")
      .select("created_by")
      .eq("id", params.eventId)
      .single()

    if (fetchError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (event.created_by !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update the event
    const { data, error } = await supabase
      .from("events")
      .update({
        title,
        description: description || null,
        date: new Date(date).toISOString(),
        location,
        max_attendees: max_attendees ? Number.parseInt(max_attendees) : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.eventId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Delete event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify the event belongs to the user
    const { data: event, error: fetchError } = await supabase
      .from("events")
      .select("created_by")
      .eq("id", params.eventId)
      .single()

    if (fetchError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (event.created_by !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete the event (this will cascade delete attendees due to foreign key)
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", params.eventId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
