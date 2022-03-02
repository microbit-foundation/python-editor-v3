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
  files: { [key: string]: string };
  projectName?: string;
}

const main = `# Add your Python code here. E.g.
from microbit import *


while True:
    display.scroll('micro:bit')
    display.show(Image.HEART)
    sleep(2000)
`;

export const defaultInitialProject: PythonProject = {
  files: {
    [MAIN_FILE]: main,
  },
};
