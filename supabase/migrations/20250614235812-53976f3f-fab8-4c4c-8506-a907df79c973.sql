
-- Drop the redundant user_passcodes table since all passcode data is now stored in user_profile
DROP TABLE IF EXISTS public.user_passcodes;
