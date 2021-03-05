import { useUnmountEffect } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";

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
