/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

import {
  getControllerHost,
  handleWorkspaceSync,
  messages,
  notifyWorkspaceLoaded,
  notifyWorkspaceSync,
} from "./embedding-controller";
import { parseMigrationFromUrl } from "./migration";

/**
 * For now we can only initialize the project name and main.py.
 * This is based on the format used to migrate between versions of the Python
 * editor and link from microbit.org to a project.
 */
export interface InitialProject {
  /**
   * The project name.
   *
   * Defaulted in the UI if unset rather than at initialization time,
   * so that it can change when the language changes.
   */
  name?: string;
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
  const host = getControllerHost();
  const migration = parseMigrationFromUrl(url);
  if (migration) {
    return {
      name: migration.meta.name,
      main: migration.source,
      isDefault: false,
    };
  }
  if (host) {
    window.addEventListener("load", () => notifyWorkspaceSync(host));
    window.addEventListener("message", (event) => {
      if (
        event?.data.type === messages.type &&
        messages.actions.workspacesync
      ) {
        const initialProject = handleWorkspaceSync(event.data);
        // TODO: Move the call for notifyWorkspaceLoaded to somewhere more sensible
        // such as inside fs.ts when initialize() method is called?
        // Note: this doesn't appear to trigger anything on the host?
        notifyWorkspaceLoaded(host);
        return initialProject;
      }
    });
  }
  return defaultInitialProject;
};
