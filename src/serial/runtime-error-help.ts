/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { parseTraceLine, Traceback } from "../device/device-hooks";

const guides = {
  i2c: ["wiring", "power-address", "sensor-driver"],
  pins: ["pin-setup", "bus-reuse"],
  import: ["module-name", "module-transfer", "module-version"],
  name: ["name-spelling", "name-initialize"],
  indentation: ["indent-spaces", "indent-level"],
  syntax: ["syntax-punctuation", "syntax-previous"],
  attribute: ["attribute-spelling", "sensor-driver"],
  type: ["type-arguments", "type-conversion"],
  value: ["value-range", "value-input"],
  division: ["division-zero", "value-input"],
  index: ["index-length", "index-loop"],
  key: ["key-exists", "key-spelling"],
  memory: ["memory-data", "memory-loop"],
  file: ["file-path", "file-transfer"],
  readonly: ["readonly-mode", "file-backup"],
  io: ["io-connection", "io-files"],
  unknown: ["unknown-location", "unknown-isolate"],
} as const;

export type RuntimeErrorKind = keyof typeof guides;

/** Conservative local rules: an arbitrary OSError is not proof of an I²C fault. */
export const explainRuntimeError = (error: string) => {
  const type = /^\s*(\w+)(?::|$)/.exec(error)?.[1];
  let kind: RuntimeErrorKind;
  if (
    ["OSError", "ValueError", "RuntimeError"].includes(type ?? "") &&
    /no i2c device at address|no pull up found on (?:sda|scl)|i2c (?:device|bus).*(?:not found|not responding)/i.test(
      error
    )
  )
    kind = "i2c";
  else if (
    ["ValueError", "RuntimeError"].includes(type ?? "") &&
    /(?:\bpin\b|\bsda\b|\bscl\b).*(?:already )?in use/i.test(error)
  )
    kind = "pins";
  else if (type === "ImportError" || type === "ModuleNotFoundError")
    kind = "import";
  else if (type === "NameError" || type === "UnboundLocalError") kind = "name";
  else if (type === "IndentationError" || type === "TabError")
    kind = "indentation";
  else if (type === "SyntaxError") kind = "syntax";
  else if (type === "AttributeError") kind = "attribute";
  else if (type === "TypeError") kind = "type";
  else if (type === "ValueError") kind = "value";
  else if (type === "ZeroDivisionError") kind = "division";
  else if (type === "IndexError") kind = "index";
  else if (type === "KeyError") kind = "key";
  else if (type === "MemoryError") kind = "memory";
  else if (
    type === "FileNotFoundError" ||
    (type === "OSError" && /\[Errno 2\]|no such file or directory/i.test(error))
  )
    kind = "file";
  else if (
    type === "OSError" &&
    /\[Errno 30\]|read.only file ?system/i.test(error)
  )
    kind = "readonly";
  else if (type === "OSError") kind = "io";
  else kind = "unknown";
  return {
    kind,
    description: `runtime-error-${kind}-description`,
    steps: guides[kind].map((step) => `runtime-error-check-${step}`),
  };
};

/** Select the closest project frame, rather than an unavailable driver file. */
export const projectErrorLocation = (
  traceback: Traceback,
  files: readonly string[]
) => {
  for (const frame of [...traceback.trace].reverse()) {
    const location = parseTraceLine(frame);
    const file = location.file?.replace(/^(?:\.\/|\/)/, "");
    const line = location.line;
    if (
      file &&
      files.includes(file) &&
      line &&
      Number.isSafeInteger(line) &&
      line > 0
    ) {
      return { file, line };
    }
  }
  return undefined;
};
