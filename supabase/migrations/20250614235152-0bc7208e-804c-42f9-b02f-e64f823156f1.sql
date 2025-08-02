
-- Add passcode_hash column to user_profile table
ALTER TABLE public.user_profile 
ADD COLUMN passcode_hash TEXT;
