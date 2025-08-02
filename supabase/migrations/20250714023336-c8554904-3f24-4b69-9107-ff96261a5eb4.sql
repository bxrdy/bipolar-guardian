-- Update Taylor Kirby Lit contact to approved status for demo purposes
UPDATE public.trusted_contacts 
SET verification_status = 'verified', updated_at = now()
WHERE name = 'Taylor Kirby Lit' AND verification_status = 'pending';

-- Verify the update
SELECT name, relationship, verification_status, updated_at 
FROM public.trusted_contacts 
WHERE name = 'Taylor Kirby Lit';