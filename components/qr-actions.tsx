"use client"

import { Button } from "@/components/ui/button"
import { downloadQRCode } from "@/lib/qr-utils"
import { Mail, Download } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface QRActionsProps {
  qrCode: string
  attendeeId: string
  attendeeName: string
}

export function QRActions({ qrCode, attendeeId, attendeeName }: QRActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const { toast } = useToast()

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      await downloadQRCode(qrCode, `${attendeeName.replace(/\s+/g, "-")}-qr-code.png`)
      toast({
        title: "QR Code Downloaded",
        description: "The QR code has been saved to your downloads folder.",
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download QR code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleSendEmail = async () => {
    setIsSendingEmail(true)
    try {
      const response = await fetch("/api/send-qr-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ attendeeId }),
      })

      if (!response.ok) {
        throw new Error("Failed to send email")
      }

      toast({
        title: "Email Sent",
        description: "QR code has been sent to the attendee's email.",
      })
    } catch (error) {
      toast({
        title: "Email Failed",
        description: "Failed to send QR code email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSendingEmail(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button size="sm" variant="outline" onClick={handleDownload} disabled={isDownloading}>
        <Download className="h-4 w-4 mr-2" />
        {isDownloading ? "Downloading..." : "Download QR"}
      </Button>
      <Button size="sm" variant="outline" onClick={handleSendEmail} disabled={isSendingEmail}>
        <Mail className="h-4 w-4 mr-2" />
        {isSendingEmail ? "Sending..." : "Email QR"}
      </Button>
    </div>
  )
}
