import { useCallback, useEffect, useRef } from "react";

/**
 * A hook that returns a function that can check for unmounts.
 *
 * This can be used where it's not sufficient or possible to
 * cancel an async action or subscription.
 */
const useIsUnmounted = () => {
  const ref = useRef(false);
  useEffect(() => {
    return () => {
      ref.current = true;
    };
  }, []);
  return useCallback(() => ref.current, [ref]);
};

export default useIsUnmounted;
