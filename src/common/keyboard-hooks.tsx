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
import { useProjectActions } from "../project/project-hooks";

export enum ShortcutNames {
  SEARCH = "SEARCH",
  SAVE = "SAVE",
  OPEN = "OPEN",
  SEND = "SEND",
}

const isMac = () => /Mac/.test(navigator.platform);

const isCtrlKeyPressed = (e: KeyboardEvent) => {
  if (isMac()) {
    return e.metaKey;
  } else {
    return e.ctrlKey;
  }
};

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
  const ctrlKeyPressed = ctrlKey
    ? isCtrlKeyPressed(e)
    : !e.ctrlKey && !e.metaKey;
  const shiftKeyPressed = shiftKey ? e.shiftKey : !e.shiftKey;
  return keysPressed && ctrlKeyPressed && shiftKeyPressed && !e.repeat;
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
  [ShortcutNames.SAVE]: {
    keys: ["s"],
    ctrlKey: true,
    shiftKey: false,
  },
  [ShortcutNames.OPEN]: {
    keys: ["o"],
    ctrlKey: true,
    shiftKey: false,
  },
  [ShortcutNames.SEND]: {
    keys: ["s"],
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
        e.preventDefault();
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

  const actions = useProjectActions();
  useEffect(() => {
    // Add global shortcut handlers here.
    const globalShortcuts: KeyboardShortcut[] = [];
    const saveShortcut = getShortcut(ShortcutNames.SAVE);
    if (!saveShortcut.handler) {
      setHandler(ShortcutNames.SAVE, () => {
        actions.save();
      });
    }
    globalShortcuts.push(saveShortcut);
    const openShortcut = getShortcut(ShortcutNames.OPEN);
    if (!openShortcut.handler) {
      setHandler(ShortcutNames.OPEN, () => {
        (document.querySelector("[data-testid='open']") as HTMLElement).click();
      });
    }
    globalShortcuts.push(openShortcut);
    const sendShortcut = getShortcut(ShortcutNames.SEND);
    if (!sendShortcut.handler) {
      setHandler(ShortcutNames.SEND, () => {
        actions.flash();
      });
    }
    globalShortcuts.push(sendShortcut);
    for (const globalShortcut of globalShortcuts) {
      globalShortcut.keydown &&
        document.addEventListener("keydown", globalShortcut.keydown);
    }
    return () => {
      for (const globalShortcut of globalShortcuts) {
        globalShortcut.keydown &&
          document.removeEventListener("keydown", globalShortcut.keydown);
      }
    };
  }, [actions, getShortcut, setHandler]);

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
