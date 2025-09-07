"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Event {
  id: string
  title: string
  description: string | null
  date: string
  location: string
  max_attendees: number | null
}

interface EditEventDialogProps {
  event: Event
  onEventUpdated?: () => void
}

export function EditEventDialog({ event, onEventUpdated }: EditEventDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description || "",
    date: new Date(event.date).toISOString().slice(0, 16), // Format for datetime-local input
    location: event.location,
    max_attendees: event.max_attendees?.toString() || "",
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update event")
      }

      setIsOpen(false)
      onEventUpdated?.()
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update event")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone and will also delete all associated attendees.")) {
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete event")
      }

      router.push("/dashboard")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete event")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl">
          <Edit className="h-4 w-4 mr-2" />
          Edit Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-800/95 dark:to-slate-900/95 backdrop-blur-xl border-white/20 dark:border-slate-700/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
            Edit Event
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400 font-medium">
            Update your event details below
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-lg font-bold text-slate-700 dark:text-slate-300">Event Title *</Label>
              <Input
                id="title"
                type="text"
                placeholder="Annual Conference 2024"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="text-lg py-3"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="text-lg font-bold text-slate-700 dark:text-slate-300">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your event..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="text-lg"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date" className="text-lg font-bold text-slate-700 dark:text-slate-300">Date & Time *</Label>
              <Input
                id="date"
                type="datetime-local"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="text-lg py-3"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location" className="text-lg font-bold text-slate-700 dark:text-slate-300">Location *</Label>
              <Input
                id="location"
                type="text"
                placeholder="Conference Center, 123 Main St"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="text-lg py-3"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="maxAttendees" className="text-lg font-bold text-slate-700 dark:text-slate-300">Maximum Attendees (Optional)</Label>
              <Input
                id="maxAttendees"
                type="number"
                placeholder="100"
                min="1"
                value={formData.max_attendees}
                onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                className="text-lg py-3"
              />
            </div>
          </div>

          {error && (
            <div className="text-lg text-red-500 font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <DialogFooter className="flex gap-3">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || isLoading}
              className="transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete Event"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isDeleting}
              className="transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-2xl hover:shadow-3xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isLoading ? "Updating..." : "Update Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
