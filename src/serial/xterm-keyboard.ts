/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
const copyShortcut = (e: KeyboardEvent): boolean => {
  if (e.ctrlKey && e.shiftKey && e.code === "KeyC") {
    e.preventDefault();
    document.execCommand("copy");
    return false;
  }
  return true;
};

let escWasPressed = false;
let escTimeout: any;

const resetEscState = () => {
  clearTimeout(escTimeout);
  escWasPressed = false;
};

const tabOutShortcut = (e: KeyboardEvent, tabTo: HTMLElement): boolean => {
  if (e.code === "Escape") {
    clearTimeout(escTimeout);
    escWasPressed = true;
    escTimeout = setTimeout(() => {
      escWasPressed = false;
    }, 2000);
  } else if (e.code === "Tab" && escWasPressed) {
    e.preventDefault();
    resetEscState();
    tabTo.focus();
    return false;
  } else {
    resetEscState();
  }
  return true;
};

const isMicroPythonCtrlShortcut = (code: string) => {
  // Editing keys are here: https://github.com/micropython/micropython/blob/46a11028521425e7d6c85458c849bb96ff82152e/lib/mp-readline/readline.c
  switch (code) {
    case "KeyA":
    case "KeyB":
    case "KeyC":
    case "KeyD":
    case "KeyE":
      return true;
    default:
      return false;
  }
};

const micropythonShortcuts = (e: KeyboardEvent) => {
  if (e.ctrlKey && isMicroPythonCtrlShortcut(e.code)) {
    // Avoid also triggering browser shortcuts, e.g. bookmark (Ctrl+D), search (Ctrl+E).
    e.preventDefault();
    e.stopPropagation();
  }
  return true;
};

const handlers = [copyShortcut, tabOutShortcut, micropythonShortcuts];

/**
 * A key event handler that can be installed on an xterm.js terminal
 * to control which key events are handled by the terminal itself and
 * which propagate.
 *
 * @returns true if xterm.js should handle the event, false otherwise.
 */
const customKeyEventHandler = (
  e: KeyboardEvent,
  tabTo: HTMLElement
): boolean => {
  for (const handler of handlers) {
    if (!handler(e, tabTo)) {
      return false;
    }
  }
  return true;
};

export default customKeyEventHandler;
