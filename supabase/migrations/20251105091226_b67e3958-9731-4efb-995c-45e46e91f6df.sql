-- Add session_id column to members table for WebRTC signaling
ALTER TABLE public.members ADD COLUMN session_id uuid UNIQUE;

-- Add index for faster lookups
CREATE INDEX idx_members_session_id ON public.members(session_id);