import { useCallback, type RefObject } from 'react';

export const useAutoScrollToError = (formRef: RefObject<HTMLFormElement | null>) => {
  const scrollToFirstError = useCallback(() => {
    if (!formRef.current) return;

    // Wait for DOM to update with aria-invalid
    requestAnimationFrame(() => {
      const firstInvalid = formRef.current?.querySelector<HTMLElement>(
        '[aria-invalid="true"]',
      );
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalid.focus();
      }
    });
  }, [formRef]);

  return { scrollToFirstError };
};
