import { useRef, useEffect } from "react";

/**
 * Custom hook to get the previous value of a prop or state.
 *
 * @param value The current value
 * @returns The previous value before the last render
 */
function usePrevious<T>(value: T): T | undefined {
  // Pass `undefined` as the initial value
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

export default usePrevious;
