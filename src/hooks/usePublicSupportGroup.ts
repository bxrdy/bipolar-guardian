
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function usePublicSupportGroup() {
  const [groupId, setGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicGroup = async () => {
      try {
        setLoading(true);
        setError(null);

        // First, try to find an existing public group
        const { data: existingGroups, error: fetchError } = await (supabase as any)
          .from('support_groups')
          .select('id')
          .eq('is_private', false)
          .limit(1);

        if (fetchError) {
          console.error('Error fetching support groups:', fetchError);
          throw fetchError;
        }

        if (existingGroups && existingGroups.length > 0) {
          setGroupId(existingGroups[0].id);
          return;
        }

        // If no public group exists, create one
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
          throw new Error('User not authenticated');
        }

        const { data: newGroup, error: createError } = await (supabase as any)
          .from('support_groups')
          .insert({
            name: 'Public Lounge',
            owner_id: user.user.id,
            is_private: false
          })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating support group:', createError);
          throw createError;
        }

        setGroupId(newGroup.id);
      } catch (err: any) {
        console.error('Error in usePublicSupportGroup:', err);
        setError(err.message || 'Failed to load support group');
        setGroupId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicGroup();
  }, []);

  return { groupId, isLoading: loading, error };
}
