import { useState, useCallback, type KeyboardEventHandler } from 'react';

export const useCapsLock = () => {
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  const handleKeyEvent: KeyboardEventHandler = useCallback((e) => {
    setIsCapsLockOn(e.getModifierState('CapsLock'));
  }, []);

  const capsLockHandlers = {
    onKeyDown: handleKeyEvent,
    onKeyUp: handleKeyEvent,
  };

  return { isCapsLockOn, capsLockHandlers };
};
