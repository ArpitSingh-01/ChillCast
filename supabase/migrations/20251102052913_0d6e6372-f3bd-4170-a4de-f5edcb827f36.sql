-- Update generate_room_code function to create 8-character alphanumeric codes
CREATE OR REPLACE FUNCTION public.generate_room_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  i INTEGER;
BEGIN
  LOOP
    new_code := '';
    -- Generate 8-character alphanumeric code
    FOR i IN 1..8 LOOP
      new_code := new_code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM rooms WHERE room_code = new_code) INTO code_exists;
    
    -- If code doesn't exist, return it
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$function$;

-- Add screen sharing columns to rooms table
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS is_screen_sharing BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS screen_share_started_at TIMESTAMP WITH TIME ZONE;