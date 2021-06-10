import { getLowercaseFileExtension } from "../fs/fs-util";
import { IntlShape } from "react-intl";

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
  exists: (f: string) => boolean,
  intl: IntlShape
): string | undefined => {
  if (filename.length === 0) {
    // Message should be: "The name cannot be empty"
    return intl.formatMessage({ id: "name-cannot-be-empty" });
  }
  if (!filename.match(/^[\p{Ll}_]+$/u)) {
    return "Python files should have lowercase names with no spaces";
  }
  if (exists(ensurePythonExtension(filename))) {
    // come back later: where to define intl (useIntl is a Hook)
    return "This file already exists";
  }
  return undefined;
};
