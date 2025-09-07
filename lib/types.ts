export interface Event {
  id: string
  title: string
  description?: string
  date: string
  location: string
  max_attendees?: number
  created_at: string
  updated_at: string
  created_by: string
}

export interface Attendee {
  id: string
  event_id: string
  name: string
  email: string
  phone?: string
  qr_code: string
  checked_in: boolean
  checked_in_at?: string
  registered_at: string
}

export interface Profile {
  id: string
  full_name?: string
  organization?: string
  created_at: string
  updated_at: string
}
