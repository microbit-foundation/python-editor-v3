/**
 * Cross-tab project synchronisation via BroadcastChannel.
 *
 * Keeps the project library and the open project in sync between tabs and
 * windows in the same browser.
 *
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
export enum ProjectSyncMessageType {
  /** A project's contents or name changed (or a project was created). */
  ReloadProject = "reload-project",
  /** A project was deleted. */
  DeleteProject = "delete-project",
}

export interface ProjectSyncMessage {
  type: ProjectSyncMessageType;
  projectIds: string[];
}

const channel =
  typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel("python-editor-projects")
    : undefined;

export const postProjectSync = (message: ProjectSyncMessage): void => {
  channel?.postMessage(message);
};

/**
 * Subscribe to project sync messages from other tabs.
 *
 * Note: BroadcastChannel does not deliver a message to the tab that sent it,
 * so listeners only see changes made elsewhere.
 *
 * @returns An unsubscribe function.
 */
export const addProjectSyncListener = (
  listener: (message: ProjectSyncMessage) => void
): (() => void) => {
  if (!channel) {
    return () => {};
  }
  const handler = (event: MessageEvent<ProjectSyncMessage>) =>
    listener(event.data);
  channel.addEventListener("message", handler);
  return () => channel.removeEventListener("message", handler);
};
