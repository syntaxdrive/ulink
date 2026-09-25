import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 *
 * Prevents rapid API requests on continuous user input (e.g. typing search terms).
 * Only returns the latest value after the specified delay (default 400ms) has passed
 * without further keystrokes.
 *
 * @param value The raw input value
 * @param delayMs Debounce delay in milliseconds (default: 400ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delayMs = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
