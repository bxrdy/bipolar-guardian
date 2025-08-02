
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type TrustedContact = Tables<'trusted_contacts'>;
type TrustedContactInsert = Omit<TablesInsert<'trusted_contacts'>, 'user_id'>;

export const useTrustedContacts = () => {
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('trusted_contacts')
        .select('*')
        .order('crisis_priority_level', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching trusted contacts:', error);
      toast.error('Failed to load trusted contacts');
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (contact: TrustedContactInsert) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('trusted_contacts')
        .insert({
          ...contact,
          user_id: user.user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      setContacts(prev => [...prev, data]);
      toast.success('Trusted contact added successfully');
      return data;
    } catch (error) {
      console.error('Error adding trusted contact:', error);
      toast.error('Failed to add trusted contact');
      throw error;
    }
  };

  const updateContact = async (id: string, updates: Partial<TrustedContact>) => {
    try {
      const { data, error } = await supabase
        .from('trusted_contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setContacts(prev => 
        prev.map(contact => contact.id === id ? data : contact)
      );
      toast.success('Contact updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating trusted contact:', error);
      toast.error('Failed to update contact');
      throw error;
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('trusted_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setContacts(prev => prev.filter(contact => contact.id !== id));
      toast.success('Contact removed successfully');
    } catch (error) {
      console.error('Error deleting trusted contact:', error);
      toast.error('Failed to remove contact');
      throw error;
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return {
    contacts,
    loading,
    addContact,
    updateContact,
    deleteContact,
    refetch: fetchContacts
  };
};
