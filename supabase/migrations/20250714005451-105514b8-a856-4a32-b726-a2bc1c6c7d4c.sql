
-- Enable real-time for support_messages table
ALTER TABLE public.support_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;

-- Ensure the default Public Lounge group exists with a proper UUID
INSERT INTO public.support_groups (id, name, owner_id, is_private)
VALUES (
  gen_random_uuid(),
  'Public Lounge',
  (SELECT id FROM auth.users LIMIT 1),
  false
) 
ON CONFLICT DO NOTHING;
