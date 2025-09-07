-- Create attendees table for storing registration information
CREATE TABLE IF NOT EXISTS attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  qr_code TEXT UNIQUE NOT NULL,
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, email)
);

-- Enable RLS for attendees table
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;

-- RLS policies for attendees - allow public registration but protect personal data
CREATE POLICY "Allow anyone to register for events" ON attendees FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow event creators to view attendees" ON attendees FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = attendees.event_id 
    AND events.created_by = auth.uid()
  )
);
CREATE POLICY "Allow event creators to update attendee check-in status" ON attendees FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = attendees.event_id 
    AND events.created_by = auth.uid()
  )
);
