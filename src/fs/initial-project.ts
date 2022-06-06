/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

import { fromByteArray } from "base64-js";
import { MAIN_FILE } from "./fs";

/**
 * We can now initialize a project with multiple files.
 * Handling is in place for backwards compatibility for V2 projects
 * where only the main file content is initialized as a string.
 */
export interface PythonProject {
  // File content as base64.
  files: Record<string, string>;
  projectName?: string;
}

/**
 *
 * @param project PythonProject.
 * @returns PythonProject where all file content has been converted to base64.
 */
export const projectFilesToBase64 = (
  files: Record<string, string>
): Record<string, string> => {
  for (const file in files) {
    files[file] = fromByteArray(new TextEncoder().encode(files[file]));
  }
  return files;
};

export const defaultMainFileContent = `# Imports go at the top
from microbit import *


# Code in a 'while True:' loop repeats forever
while True:
    display.show(Image.HEART)
    sleep(1000)
    display.scroll('Hello')
`;

export const defaultInitialProject: PythonProject = {
  files: projectFilesToBase64({
    [MAIN_FILE]: defaultMainFileContent,
  }),
};
