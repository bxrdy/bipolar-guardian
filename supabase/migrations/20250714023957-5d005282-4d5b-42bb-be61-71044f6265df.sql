-- Update Michael York (therapist) contact to verified status for demo purposes
UPDATE public.trusted_contacts 
SET verification_status = 'verified', updated_at = now()
WHERE name = 'Michael York' AND relationship = 'Therapist' AND verification_status = 'pending';

-- Verify the update
SELECT name, relationship, verification_status, updated_at 
FROM public.trusted_contacts 
WHERE name = 'Michael York';