const copyShortcut = (e: KeyboardEvent): boolean => {
  console.log(e.key);
  if (e.ctrlKey && e.shiftKey && e.key === "C") {
    e.preventDefault();
    document.execCommand("copy");
    return false;
  }
  return true;
};

const softRebootShortcut = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key === "d") {
    // MicroPython handles this as a soft reboot.
    // Avoid it also adding a bookmark! (Ctrl-D on Windows/Linux)
    e.preventDefault();
    e.stopPropagation();
  }
  return true;
};

const handlers = [copyShortcut, softRebootShortcut];
const customKeyEventHandler = (e: KeyboardEvent): boolean => {
  for (const handler of handlers) {
    if (!handler(e)) {
      return false;
    }
  }
  return true;
};

export default customKeyEventHandler;
