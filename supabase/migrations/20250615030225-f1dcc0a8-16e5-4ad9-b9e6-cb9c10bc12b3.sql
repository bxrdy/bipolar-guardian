
-- Remove passcode-related columns from user_profile table
ALTER TABLE public.user_profile 
DROP COLUMN IF EXISTS passcode_hash,
DROP COLUMN IF EXISTS passcode_login_enabled,
DROP COLUMN IF EXISTS last_unlock_time;

-- Remove the public passcode check policy
DROP POLICY IF EXISTS "Allow public passcode check by email" ON public.user_profile;
