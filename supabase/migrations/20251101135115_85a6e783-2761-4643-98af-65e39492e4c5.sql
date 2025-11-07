-- Add room_code column to rooms table
ALTER TABLE rooms ADD COLUMN room_code TEXT UNIQUE;

-- Create function to generate 6-digit room code
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 6-digit code
    new_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM rooms WHERE room_code = new_code) INTO code_exists;
    
    -- If code doesn't exist, return it
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate room code on insert
CREATE OR REPLACE FUNCTION set_room_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.room_code IS NULL THEN
    NEW.room_code := generate_room_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_room_code
BEFORE INSERT ON rooms
FOR EACH ROW
EXECUTE FUNCTION set_room_code();