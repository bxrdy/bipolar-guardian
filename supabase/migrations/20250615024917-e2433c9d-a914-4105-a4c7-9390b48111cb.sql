
-- Add a new RLS policy to allow unauthenticated users to check passcode availability by email
-- This is needed for the login flow to detect if a user has passcode login enabled
CREATE POLICY "Allow public passcode check by email" 
  ON public.user_profile 
  FOR SELECT 
  TO public
  USING (true);
