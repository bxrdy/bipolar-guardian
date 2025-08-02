
-- Create support_groups table
CREATE TABLE IF NOT EXISTS public.support_groups (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_private boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create support_group_members table
CREATE TABLE IF NOT EXISTS public.support_group_members (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.support_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create support_messages table for chat functionality
CREATE TABLE IF NOT EXISTS public.support_messages (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id uuid REFERENCES public.support_groups(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.support_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for support_groups
CREATE POLICY "Users can view public groups" ON public.support_groups
FOR SELECT USING (NOT is_private OR owner_id = auth.uid());

CREATE POLICY "Users can create their own groups" ON public.support_groups
FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Group owners can update their groups" ON public.support_groups
FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Group owners can delete their groups" ON public.support_groups
FOR DELETE USING (auth.uid() = owner_id);

-- RLS policies for support_group_members
CREATE POLICY "Users can view group members if they have access" ON public.support_group_members
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.support_groups sg 
    WHERE sg.id = group_id 
    AND (NOT sg.is_private OR sg.owner_id = auth.uid())
  )
  OR user_id = auth.uid()
);

CREATE POLICY "Users can join groups they have access to" ON public.support_group_members
FOR INSERT WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.support_groups sg 
    WHERE sg.id = group_id 
    AND (NOT sg.is_private OR sg.owner_id = auth.uid())
  )
);

CREATE POLICY "Users can leave groups" ON public.support_group_members
FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for support_messages
CREATE POLICY "Users can view messages in groups they're members of" ON public.support_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.support_group_members sgm 
    WHERE sgm.group_id = support_messages.group_id 
    AND sgm.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.support_groups sg 
    WHERE sg.id = support_messages.group_id 
    AND NOT sg.is_private
  )
);

CREATE POLICY "Users can send messages to groups they're members of" ON public.support_messages
FOR INSERT WITH CHECK (
  auth.uid() = sender_id 
  AND (
    EXISTS (
      SELECT 1 FROM public.support_group_members sgm 
      WHERE sgm.group_id = support_messages.group_id 
      AND sgm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.support_groups sg 
      WHERE sg.id = support_messages.group_id 
      AND NOT sg.is_private
    )
  )
);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_support_groups_updated_at 
  BEFORE UPDATE ON public.support_groups 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_support_groups_is_private ON public.support_groups(is_private);
CREATE INDEX IF NOT EXISTS idx_support_group_members_group_id ON public.support_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_support_group_members_user_id ON public.support_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_group_id ON public.support_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON public.support_messages(created_at);

-- Insert default "Public Lounge" group (using a dummy UUID for now, will be updated by the app)
INSERT INTO public.support_groups (id, name, owner_id, is_private)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Public Lounge',
  '00000000-0000-0000-0000-000000000001'::uuid,
  false
) ON CONFLICT (id) DO NOTHING;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_groups TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.support_group_members TO authenticated;
GRANT SELECT, INSERT ON public.support_messages TO authenticated;
