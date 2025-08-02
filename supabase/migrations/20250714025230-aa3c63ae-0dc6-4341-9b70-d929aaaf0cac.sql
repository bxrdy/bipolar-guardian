-- Update Michael York's verification status to verified
UPDATE public.trusted_contacts 
SET verification_status = 'verified', updated_at = now()
WHERE name = 'Michael York' AND verification_status = 'pending';

-- Add Johanna Johnson as a verified friend contact
-- Using a user_id from existing contacts
INSERT INTO public.trusted_contacts (
  user_id, 
  name, 
  relationship, 
  phone, 
  email, 
  verification_status, 
  crisis_priority_level,
  notification_preferences
) VALUES (
  (SELECT user_id FROM public.trusted_contacts LIMIT 1),
  'Johanna Johnson',
  'friend',
  '+1 (555) 234-5678',
  'johanna.johnson@gmail.com',
  'verified',
  2,
  '{"crisis": true, "check_in": true, "updates": false}'::jsonb
);

-- Add Nate Nauta as a verified healthcare provider contact
INSERT INTO public.trusted_contacts (
  user_id, 
  name, 
  relationship, 
  phone, 
  email, 
  verification_status, 
  crisis_priority_level,
  notification_preferences
) VALUES (
  (SELECT user_id FROM public.trusted_contacts LIMIT 1),
  'Nate Nauta',
  'healthcare',
  '+1 (555) 876-5432',
  'nate.nauta@healthcenter.org',
  'verified',
  2,
  '{"crisis": true, "check_in": true, "updates": false}'::jsonb
);

-- Verify the updates
SELECT name, relationship, verification_status, phone, email 
FROM public.trusted_contacts 
WHERE name IN ('Michael York', 'Johanna Johnson', 'Nate Nauta')
ORDER BY name;