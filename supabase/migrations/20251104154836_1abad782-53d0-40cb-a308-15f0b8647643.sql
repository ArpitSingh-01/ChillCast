-- Enable REPLICA IDENTITY FULL for rooms table to ensure complete row data in real-time updates
ALTER TABLE public.rooms REPLICA IDENTITY FULL;