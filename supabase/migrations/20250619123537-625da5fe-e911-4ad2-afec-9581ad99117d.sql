
-- Add chat_model and vision_model columns to user_profile table
ALTER TABLE public.user_profile 
ADD COLUMN chat_model TEXT DEFAULT 'deepseek/deepseek-r1:free',
ADD COLUMN vision_model TEXT DEFAULT 'google/gemini-2.0-flash-exp:free';
