/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { getLowercaseFileExtension } from "../fs/fs-util";
import { IntlShape } from "react-intl";
import { isNameLengthValid } from "../fs/fs";
import { InputValidationResult } from "../common/InputDialog";

export const isPythonFile = (filename: string) =>
  getLowercaseFileExtension(filename) === "py";

export const ensurePythonExtension = (filename: string) =>
  isPythonFile(filename) ? filename : `${filename}.py`;

// For now at least.
export const isEditableFile = isPythonFile;

/**
 * Constraints:
 *
 * 1. What can be created as a file in MicroPython's file system.
 * 2. What can be referenced via an import in the grammar, but as it's
 *    decidedly non-trivial, we've gone with a simplified version.
 * 3. Modules should have short, all-lowercase names (PEP8, so advice only)
 *
 * @param filename The name to check. May be user input without a file extension.
 * @param exists A function to check whether a file exists.
 */
export const validateNewFilename = (
  filename: string,
  exists: (f: string) => boolean,
  intl: IntlShape
): InputValidationResult => {
  // It's valid with or without the extension. Run checks without.
  if (isPythonFile(filename)) {
    filename = filename.slice(0, -".py".length);
  }

  if (filename.length === 0) {
    return {
      ok: false,
      message: intl.formatMessage({ id: "file-name-not-empty" }),
    };
  }
  if (!isNameLengthValid(filename)) {
    return {
      ok: false,
      message: intl.formatMessage({ id: "file-name-length" }),
    };
  }
  if (filename.match(/\s/)) {
    return {
      ok: false,
      message: intl.formatMessage({ id: "file-name-whitespace" }),
    };
  }
  // This includes Unicode ranges that we should exclude, but it's
  // probably not worth the bundle size to do this correctly.
  // If we revisit see Pyright's implementation.
  const invalidCharMatch = /[^a-zA-Z0-9_\u{a1}-\u{10ffff}]/u.exec(filename);
  if (invalidCharMatch) {
    return {
      ok: false,
      message: intl.formatMessage(
        { id: "file-name-invalid-character" },
        {
          invalid: invalidCharMatch[0],
        }
      ),
    };
  }
  if (filename.match("^[0-9]")) {
    return {
      ok: false,
      message: intl.formatMessage({ id: "file-name-start-number" }),
    };
  }
  if (filename.match("[A-Z]")) {
    return {
      // This one is PEP8 so we still allow you to proceed.
      // See https://github.com/microbit-foundation/python-editor-v3/issues/1026
      ok: true,
      message: intl.formatMessage({ id: "file-name-lowercase-only" }),
    };
  }
  if (exists(ensurePythonExtension(filename))) {
    return {
      ok: false,
      message: intl.formatMessage({ id: "file-already-exists" }),
    };
  }
  return { ok: true };
};
