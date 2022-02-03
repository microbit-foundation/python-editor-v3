/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

import { parseMigrationFromUrl } from "./migration";

/**
 * For now we can only initialize the project name and main.py.
 * This is based on the format used to migrate between versions of the Python
 * editor and link from microbit.org to a project.
 */
export interface InitialProject {
  /**
   * The project name.
   */
  name: string;
  /**
   * The main.py source content.
   */
  main: string;
  /**
   * Tracks if the main.py content is the built-in default content.
   */
  isDefault: boolean;
}

export const defaultInitialProject: InitialProject = {
  name: "Untitled project",
  main: `# Add your Python code here. E.g.
from microbit import *


while True:
    display.scroll('micro:bit')
    display.show(Image.HEART)
    sleep(2000)
`,
  isDefault: true,
};

export const createInitialProject = (url: string): InitialProject => {
  const migration = parseMigrationFromUrl(url);
  if (migration) {
    return {
      name: migration.meta.name,
      main: migration.source,
      isDefault: false,
    };
  }
  return defaultInitialProject;
};
