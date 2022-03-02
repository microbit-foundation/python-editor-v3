/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

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
export const projectFilesToBase64 = (project: PythonProject): PythonProject => {
  for (const file in project.files) {
    project.files[file] = btoa(project.files[file]);
  }
  return project;
};

export const defaultMainFileContent = `# Add your Python code here. E.g.
from microbit import *


while True:
    display.scroll('micro:bit')
    display.show(Image.HEART)
    sleep(2000)
`;

export const defaultInitialProject = projectFilesToBase64({
  files: {
    [MAIN_FILE]: defaultMainFileContent,
  },
});
