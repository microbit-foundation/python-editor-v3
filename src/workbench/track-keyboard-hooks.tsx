/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface TrackKeyboardContextValue {
  activeKeys: Set<string>;
}

const TrackKeyboardContext = createContext<
  TrackKeyboardContextValue | undefined
>(undefined);

export const useTrackKeyboard = (): TrackKeyboardContextValue => {
  const value = useContext(TrackKeyboardContext);
  if (!value) {
    throw new Error("Missing provider!");
  }
  return value;
};

const TrackKeyboardProvider = ({ children }: { children: ReactNode }) => {
  const [keys, setKeys] = useState<Set<string>>(new Set());

  const addKey = useCallback(
    (event: KeyboardEvent) => {
      const newKeys = new Set(keys);
      newKeys.add(event.key);
      setKeys(newKeys);
    },
    [keys]
  );

  const removeKey = useCallback(
    (event: KeyboardEvent) => {
      const newKeys = new Set(keys);
      newKeys.delete(event.key);
      setKeys(newKeys);
    },
    [keys]
  );

  useEffect(() => {
    window.addEventListener("keydown", addKey);
    window.addEventListener("keyup", removeKey);

    return () => {
      window.removeEventListener("keydown", addKey);
      window.removeEventListener("keyup", removeKey);
    };
  }, [addKey, removeKey]);

  const value: TrackKeyboardContextValue = useMemo(() => {
    return { activeKeys: keys };
  }, [keys]);

  return (
    <TrackKeyboardContext.Provider value={value}>
      {children}
    </TrackKeyboardContext.Provider>
  );
};

export default TrackKeyboardProvider;
