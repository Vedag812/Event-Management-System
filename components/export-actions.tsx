"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ExportActionsProps {
  eventId: string
  eventTitle: string
}

export function ExportActions({ eventId, eventTitle }: ExportActionsProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isSendingEmails, setIsSendingEmails] = useState(false)
  const { toast } = useToast()

  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      const response = await fetch(`/api/export-csv?eventId=${eventId}`)
      
      if (!response.ok) {
        throw new Error("Failed to export CSV")
      }

      // Get the CSV content
      const csvContent = await response.text()
      
      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${eventTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_attendees.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "CSV Exported",
        description: "Attendee data has been exported successfully.",
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export CSV. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleSendAllEmails = async () => {
    setIsSendingEmails(true)
    try {
      const response = await fetch("/api/send-all-qr-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId }),
      })

      if (!response.ok) {
        throw new Error("Failed to send emails")
      }

      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Emails Sent",
          description: `${result.results.successful} emails sent successfully. ${result.results.failed > 0 ? `${result.results.failed} failed.` : ''}`,
        })
      } else {
        throw new Error(result.error || "Failed to send emails")
      }
    } catch (error) {
      console.error("Email sending error:", error)
      toast({
        title: "Email Failed",
        description: "Failed to send QR code emails. Please check your email configuration.",
        variant: "destructive",
      })
    } finally {
      setIsSendingEmails(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleExportCSV} disabled={isExporting}>
        <Download className="h-4 w-4 mr-2" />
        {isExporting ? "Exporting..." : "Export CSV"}
      </Button>
      <Button variant="outline" onClick={handleSendAllEmails} disabled={isSendingEmails}>
        <Mail className="h-4 w-4 mr-2" />
        {isSendingEmails ? "Sending..." : "Send All QR Codes"}
      </Button>
    </div>
  )
}
