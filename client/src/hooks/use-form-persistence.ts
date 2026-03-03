import { useEffect, useCallback } from 'react';
import { getSessionItem, setSessionItem, removeSessionItem } from '@/utils/session-storage';

type FormFields = Record<string, string>;

export const useFormPersistence = (
  key: string,
  fields: FormFields,
  setters: Record<string, (value: string) => void>,
) => {
  // Restore on mount
  useEffect(() => {
    const saved = getSessionItem<FormFields>(key);
    if (!saved) return;

    for (const [field, setter] of Object.entries(setters)) {
      const value = saved[field];
      if (value) setter(value);
    }
    // Only restore once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Save on field changes
  useEffect(() => {
    setSessionItem(key, fields);
  }, [key, fields]);

  const clearPersisted = useCallback(() => {
    removeSessionItem(key);
  }, [key]);

  return { clearPersisted };
};
