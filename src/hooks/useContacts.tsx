
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface Contact {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  company: string | null;
  status: string;
  notes: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
  lists?: string[];
}

export interface ContactFormData {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  company?: string;
  notes?: string;
  source?: string;
  listIds?: string[];
}

export const useContacts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          contact_list_members(
            contact_lists(name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map(contact => ({
        ...contact,
        lists: contact.contact_list_members?.map(clm => clm.contact_lists?.name).filter(Boolean) || []
      }));
    },
    enabled: !!user
  });

  const createContact = useMutation({
    mutationFn: async (contactData: ContactFormData) => {
      if (!user) throw new Error('Usuario no autenticado');
      
      const { listIds, ...contactInfo } = contactData;
      
      const { data: contact, error } = await supabase
        .from('contacts')
        .insert({
          ...contactInfo,
          user_id: user.id,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      // Add to lists if specified
      if (listIds && listIds.length > 0) {
        const listMembers = listIds.map(listId => ({
          contact_id: contact.id,
          list_id: listId
        }));

        const { error: listError } = await supabase
          .from('contact_list_members')
          .insert(listMembers);

        if (listError) console.error('Error adding to lists:', listError);
      }

      return contact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
      toast({
        title: "Contacto creado",
        description: "El contacto se agregó exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message === 'duplicate key value violates unique constraint "contacts_user_id_email_key"' 
          ? "Ya existe un contacto con este email." 
          : "No se pudo crear el contacto.",
        variant: "destructive",
      });
    }
  });

  const importContacts = useMutation({
    mutationFn: async (data: { contacts: ContactFormData[]; listId?: string }) => {
      if (!user) throw new Error('Usuario no autenticado');
      
      const { contacts: contactsData, listId } = data;
      const results = { success: 0, errors: 0, duplicates: 0 };

      for (const contactData of contactsData) {
        try {
          const { data: contact, error } = await supabase
            .from('contacts')
            .insert({
              ...contactData,
              user_id: user.id,
              status: 'active'
            })
            .select()
            .single();

          if (error) {
            if (error.code === '23505') { // Duplicate key
              results.duplicates++;
            } else {
              results.errors++;
            }
            continue;
          }

          // Add to list if specified
          if (listId && contact) {
            await supabase
              .from('contact_list_members')
              .insert({
                contact_id: contact.id,
                list_id: listId
              });
          }

          results.success++;
        } catch (err) {
          results.errors++;
        }
      }

      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
      
      toast({
        title: "Importación completada",
        description: `${results.success} contactos importados, ${results.duplicates} duplicados omitidos, ${results.errors} errores.`,
      });
    }
  });

  return {
    contacts,
    isLoading,
    createContact,
    importContacts
  };
};
