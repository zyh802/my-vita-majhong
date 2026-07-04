import { useEffect, useRef } from 'react';

/**
 * A timer hook that calls onTick every second while isRunning is true.
 *
 * @param isRunning - Whether the timer should be running
 * @param onTick - Callback invoked each second
 */
export function useTimer(isRunning: boolean, onTick: () => void): void {
  const callbackRef = useRef(onTick);

  // Keep the callback ref updated without re-creating the interval
  useEffect(() => {
    callbackRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      callbackRef.current();
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isRunning]);
}
