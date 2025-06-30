
import React, { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from './useDebounce';

export const useEmailValidation = (email: string) => {
  const [isChecking, setIsChecking] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedEmail = useDebounce(email, 500);

  const checkEmailExists = useCallback(async (emailToCheck: string) => {
    if (!emailToCheck || !emailToCheck.includes('@')) {
      setEmailExists(false);
      setError(null);
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      // Verificar en la tabla profiles
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', emailToCheck)
        .single();

      if (queryError && queryError.code !== 'PGRST116') {
        setError('Error verificando email');
        return;
      }

      setEmailExists(!!data);
    } catch (err) {
      setError('Error verificando email');
      console.error('Email validation error:', err);
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Ejecutar verificación cuando cambie el email con debounce
  React.useEffect(() => {
    if (debouncedEmail) {
      checkEmailExists(debouncedEmail);
    }
  }, [debouncedEmail, checkEmailExists]);

  return {
    isChecking,
    emailExists,
    error,
    checkEmailExists
  };
};
