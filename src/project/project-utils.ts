import { getLowercaseFileExtension } from "../fs/fs-util";

export const isPythonFile = (filename: string) =>
  getLowercaseFileExtension(filename) === "py";

export const ensurePythonExtension = (filename: string) =>
  isPythonFile(filename) ? filename : `${filename}.py`;

// For now at least.
export const isEditableFile = isPythonFile;

/**
 * From https://www.python.org/dev/peps/pep-0008/#package-and-module-names
 *
 * "Modules should have short, all-lowercase names.
 * Underscores can be used in the module name if it improves readability."
 *
 * @param filename The name to check. May be user input without a file extension.
 * @param exists A function to check whether a file exists.
 */
export const validateNewFilename = (
  filename: string,
  exists: (f: string) => boolean
): string | undefined => {
  if (filename.length === 0) {
    return "The name cannot be empty";
  }
  if (!filename.match(/^[\p{Ll}_]+$/u)) {
    return "Python files should have lowercase names with no spaces";
  }
  if (exists(ensurePythonExtension(filename))) {
    return "This file already exists";
  }
  return undefined;
};
