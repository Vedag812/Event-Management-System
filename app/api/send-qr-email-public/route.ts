import { type NextRequest, NextResponse } from "next/server"
import { generateQRCodeDataURL } from "@/lib/qr-utils"
import { createClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email"

// Public endpoint: send attendee QR email right after registration
// Expects JSON body: { eventId, attendeeEmail, attendeeName, qrCode }
export async function POST(request: NextRequest) {
  try {
    const { eventId, attendeeEmail, attendeeName, qrCode } = await request.json()

    if (!eventId || !attendeeEmail || !attendeeName || !qrCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch event details (events are publicly readable per RLS policy)
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, title, date, location")
      .eq("id", eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Generate QR code data URL
    const qrCodeDataURL = await generateQRCodeDataURL(qrCode, 300)

    // If RESEND is not configured, return success with QR for manual fallback
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        success: true,
        message: "Email service not configured. QR code generated for manual sharing.",
        qrCodeDataURL,
        qrCode,
      })
    }

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🎫 Your Event QR Code</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hello <strong>${attendeeName}</strong>,</p>
            <p style="color: #666; margin-bottom: 25px;">Here's your QR code for the event: <strong style="color: #667eea;">${event.title}</strong></p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">📅 Event Details</h3>
              <ul style="color: #666; margin: 0; padding-left: 20px;">
                <li><strong>Date:</strong> ${new Date(event.date as unknown as string).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
                <li><strong>Time:</strong> ${new Date(event.date as unknown as string).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</li>
                <li><strong>Location:</strong> ${event.location}</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
              <img src="${qrCodeDataURL}" alt="QR Code" style="max-width: 250px; border: 2px solid #667eea; padding: 15px; background: white; border-radius: 8px;" />
              <p style="margin: 15px 0 0 0; color: #666; font-size: 14px;">📱 Scan this QR code at the event for check-in</p>
            </div>
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #1976d2; font-size: 14px;"><strong>QR Code:</strong> ${qrCode}</p>
            </div>
            <p style="color: #666; margin-bottom: 0;">Please bring this QR code to the event for check-in. We look forward to seeing you there!</p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>This is an automated message from Event Attendance System</p>
          </div>
        </div>
      `

    try {
      const result = await sendEmail({
        from: process.env.RESEND_FROM || process.env.SENDGRID_FROM || 'Event Attendance <onboarding@resend.dev>',
        to: attendeeEmail,
        subject: `Your QR Code for ${event.title}`,
        html,
        attachments: [{ filename: 'qr-code.png', contentBase64: qrCodeDataURL.split(',')[1], contentType: 'image/png' }],
      })
      return NextResponse.json({ success: true, message: "QR code email sent", emailId: result.id })
    } catch (providerError) {
      // Fallback with manual QR in case of provider errors
      return NextResponse.json({
        success: true,
        message: "Email provider error. QR code generated for manual sharing.",
        qrCodeDataURL,
        qrCode,
      })
    }
  } catch (error) {
    console.error("Error in send-qr-email-public:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}


