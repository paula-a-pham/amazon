import { useState, useEffect, useRef } from 'react';

const parseSecondsFromMessage = (message: string): number | null => {
  const match = message.match(/(\d+)\s*seconds?/i);
  return match ? parseInt(match[1], 10) : null;
};

export const useRateLimitTimer = (errorMessage: string | undefined) => {
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (!errorMessage) {
      setSecondsRemaining(0);
      return;
    }

    const seconds = parseSecondsFromMessage(errorMessage);
    if (!seconds) return;

    setSecondsRemaining(seconds);

    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [errorMessage]);

  return {
    secondsRemaining,
    isRateLimited: secondsRemaining > 0,
  };
};
