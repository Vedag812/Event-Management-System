-- Create events table for storing event information
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  max_attendees INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS for events table
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS policies for events
CREATE POLICY "Allow users to view all events" ON events FOR SELECT USING (true);
CREATE POLICY "Allow users to create events" ON events FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Allow users to update their own events" ON events FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Allow users to delete their own events" ON events FOR DELETE USING (auth.uid() = created_by);
