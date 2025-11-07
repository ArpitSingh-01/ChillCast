-- Create rooms table for watch parties
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_name TEXT NOT NULL,
  host_password TEXT NOT NULL,
  room_password TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  host_ip INET,
  yt_video_url TEXT,
  video_play_time INTEGER DEFAULT 0,
  is_playing BOOLEAN DEFAULT false,
  screen_share_time INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create members table for tracking room participants
CREATE TABLE public.members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  ip_address INET,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  is_online BOOLEAN DEFAULT true
);

-- Create chats table for messages
CREATE TABLE public.chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  receiver TEXT,
  message TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics table for tracking
CREATE TABLE public.analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  duration INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rooms (public read, authenticated create)
CREATE POLICY "Anyone can view rooms"
  ON public.rooms FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create rooms"
  ON public.rooms FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update rooms"
  ON public.rooms FOR UPDATE
  USING (true);

-- RLS Policies for members
CREATE POLICY "Anyone can view members"
  ON public.members FOR SELECT
  USING (true);

CREATE POLICY "Anyone can join as member"
  ON public.members FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update their member status"
  ON public.members FOR UPDATE
  USING (true);

-- RLS Policies for chats
CREATE POLICY "Members can view chats in their room"
  ON public.chats FOR SELECT
  USING (true);

CREATE POLICY "Members can send chats"
  ON public.chats FOR INSERT
  WITH CHECK (true);

-- RLS Policies for analytics
CREATE POLICY "Anyone can insert analytics"
  ON public.analytics FOR INSERT
  WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;