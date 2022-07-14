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
  useMemo,
  useState,
} from "react";

export enum ShortcutNames {
  SEARCH = "SEARCH",
}

const isMac = () => /Mac/.test(navigator.platform);
const keysPressed = (
  e: KeyboardEvent,
  keys: string[],
  ctrlKey: boolean,
  shiftKey: boolean
) => {
  let keysPressed = true;
  for (const key of keys) {
    if (e.key !== key && e.key !== key.toUpperCase()) {
      keysPressed = false;
    }
  }
  const ctrlKeyPressed =
    (ctrlKey && isMac() && e.metaKey) || (ctrlKey && !isMac() && e.ctrlKey);
  return keysPressed && ctrlKeyPressed && shiftKey && e.shiftKey && !e.repeat;
};

export interface KeyboardShortcut {
  handler?: () => void;
  keydown?: (e: KeyboardEvent) => void;
  keys: string[]; // Use lowercase keys.
  ctrlKey: boolean;
  shiftKey: boolean;
}

export type KeyboardShortcuts = Record<ShortcutNames, KeyboardShortcut>;

export const defaultKeyboardShortcuts: KeyboardShortcuts = {
  [ShortcutNames.SEARCH]: {
    keys: ["f"],
    ctrlKey: true,
    shiftKey: true,
  },
};

export type KeyboardShortcutsContextValue = {
  getShortcut: (shortcutName: ShortcutNames) => KeyboardShortcut;
  setHandler: (shortcutName: ShortcutNames, handler: () => void) => void;
};

const KeyboardShortcutsContext = createContext<
  KeyboardShortcutsContextValue | undefined
>(undefined);

export const useKeyboardShortcuts = (): KeyboardShortcutsContextValue => {
  const keyboardShortcuts = useContext(KeyboardShortcutsContext);
  if (!keyboardShortcuts) {
    throw new Error("Missing provider");
  }
  return keyboardShortcuts;
};

const KeyboardShortcutsProvider = ({ children }: { children: ReactNode }) => {
  const [keyboardShortcuts, setKeyboardShortcuts] = useState<KeyboardShortcuts>(
    defaultKeyboardShortcuts
  );
  const getShortcut = useCallback(
    (shortcutName: ShortcutNames): KeyboardShortcut => {
      return keyboardShortcuts[shortcutName];
    },
    [keyboardShortcuts]
  );
  const createKeydown = (shortcut: KeyboardShortcut) => {
    return (e: KeyboardEvent) => {
      if (
        keysPressed(e, shortcut.keys, shortcut.ctrlKey, shortcut.shiftKey) &&
        shortcut.handler
      ) {
        shortcut.handler();
      }
    };
  };
  const setHandler = useCallback(
    (shortcutName: ShortcutNames, handler: () => void) => {
      const shortcut = getShortcut(shortcutName);
      if (shortcut) {
        const updatedShortcuts = { ...keyboardShortcuts };
        updatedShortcuts[shortcutName].handler = handler;
        updatedShortcuts[shortcutName].keydown = createKeydown(
          updatedShortcuts[shortcutName]
        );
        setKeyboardShortcuts(updatedShortcuts);
      }
    },
    [getShortcut, keyboardShortcuts, setKeyboardShortcuts]
  );
  const value: KeyboardShortcutsContextValue = useMemo(
    () => ({ getShortcut, setHandler }),
    [getShortcut, setHandler]
  );
  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
};

export default KeyboardShortcutsProvider;
