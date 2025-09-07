import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { generateQRCodeDataURL } from "@/lib/qr-utils"
import { Resend } from "resend"

export async function POST(request: NextRequest) {
  try {
    const { eventId } = await request.json()

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

    if (attendeesError || !attendees || attendees.length === 0) {
      return NextResponse.json({ error: "No attendees found" }, { status: 404 })
    }

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "Email service not configured",
        message: "To enable email sending, get a free API key from https://resend.com and add RESEND_API_KEY to your .env.local file"
      })
    }

    let successCount = 0
    let failureCount = 0
    const results = []

    // Send emails to all attendees
    for (const attendee of attendees) {
      try {
        // Generate QR code data URL
        const qrCodeDataURL = await generateQRCodeDataURL(attendee.qr_code, 300)

        // Send email using Resend
        const { data, error } = await resend.emails.send({
          from: process.env.RESEND_FROM || 'Event Attendance <onboarding@resend.dev>',
          to: [attendee.email],
          subject: `Your QR Code for ${event.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">🎫 Your Event QR Code</h1>
              </div>
              <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hello <strong>${attendee.name}</strong>,</p>
                <p style="color: #666; margin-bottom: 25px;">Here's your QR code for the event: <strong style="color: #667eea;">${event.title}</strong></p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #333; margin-top: 0;">📅 Event Details</h3>
                  <ul style="color: #666; margin: 0; padding-left: 20px;">
                    <li><strong>Date:</strong> ${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
                    <li><strong>Time:</strong> ${new Date(event.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</li>
                    <li><strong>Location:</strong> ${event.location}</li>
                  </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                  <img src="${qrCodeDataURL}" alt="QR Code" style="max-width: 250px; border: 2px solid #667eea; padding: 15px; background: white; border-radius: 8px;" />
                  <p style="margin: 15px 0 0 0; color: #666; font-size: 14px;">📱 Scan this QR code at the event for check-in</p>
                </div>
                
                <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; color: #1976d2; font-size: 14px;"><strong>QR Code:</strong> ${attendee.qr_code}</p>
                </div>
                
                <p style="color: #666; margin-bottom: 0;">Please bring this QR code to the event for check-in. We look forward to seeing you there!</p>
              </div>
              <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                <p>This is an automated message from Event Attendance System</p>
              </div>
            </div>
          `,
          attachments: [
            {
              filename: 'qr-code.png',
              content: qrCodeDataURL.split(',')[1],
            }
          ]
        })

        if (error) {
          throw error
        }
        successCount++
        results.push({ attendee: attendee.email, status: 'success' })
        
      } catch (emailError) {
        console.error(`Failed to send email to ${attendee.email}:`, emailError)
        failureCount++
        results.push({ attendee: attendee.email, status: 'failed', error: emailError })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Emails sent: ${successCount} successful, ${failureCount} failed`,
      results: {
        total: attendees.length,
        successful: successCount,
        failed: failureCount,
        details: results
      }
    })

  } catch (error) {
    console.error("Error sending bulk emails:", error)
    return NextResponse.json({ error: "Failed to send emails" }, { status: 500 })
  }
}
