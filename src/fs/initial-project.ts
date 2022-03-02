/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

import { MAIN_FILE } from "./fs";

/**
 * For now we can only initialize the project name and main.py.
 * This is based on the format used to migrate between versions of the Python
 * editor and link from microbit.org to a project.
 */

export interface PythonProject {
  files: { [key: string]: string };
  projectName?: string;
}

export interface InitialProject extends PythonProject {
  isDefault: boolean;
}

const main = `# Add your Python code here. E.g.
from microbit import *


while True:
    display.scroll('micro:bit')
    display.show(Image.HEART)
    sleep(2000)
`;

export const defaultInitialProject: InitialProject = {
  files: {
    [MAIN_FILE]: main,
  },
  isDefault: true,
};
