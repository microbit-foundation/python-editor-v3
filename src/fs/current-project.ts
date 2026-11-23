/**
 * Which project the editor opens, and its storage.
 *
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { toByteArray } from "base64-js";
import { isPublicFacingStage } from "../environment";
import { Logging } from "../logging/logging";
import { generateId } from "./fs-util";
import { MAIN_FILE } from "./fs";
import { defaultInitialProject } from "./initial-project";
import { ProjectLink } from "./project-link";
import { ProjectsDatabase } from "./projects-db";
import { SessionStorageFSStorage } from "./storage";
import {
  reportProjectsDatabaseActive,
  reportStorageVersionError,
} from "./storage-status";

/**
 * The open project is per tab, as the whole project used to be.
 */
const currentProjectKey = "currentProjectId";

export const getCurrentProjectId = (
  session: Storage | undefined
): string | undefined => session?.getItem(currentProjectKey) ?? undefined;

export const setCurrentProjectId = (
  session: Storage | undefined,
  id: string | undefined
): void => {
  if (id === undefined) {
    session?.removeItem(currentProjectKey);
  } else {
    session?.setItem(currentProjectKey, id);
  }
};

export const sessionStorageIfPossible = (): Storage | undefined => {
  try {
    return window.sessionStorage;
  } catch {
    // SecurityError in some embedding scenarios (issue 736) and no window in
    // tests; either way there is nothing to read.
    return undefined;
  }
};

/**
 * Where a tab keeps its project, as the project_storage user property.
 *
 * It is there to answer one question: how many sessions really run without
 * the projects database, and why. That decides whether the session-storage
 * fallback earns its keep.
 */
export type ProjectStorageMode =
  | "database"
  | "session_no_indexeddb"
  | "session_open_failed"
  // Iframe controller mode: the embedding page keeps the project.
  | "host";

export const reportProjectStorageMode = (
  logging: Logging,
  mode: ProjectStorageMode
): void => logging.setUserProperty("project_storage", mode);

/**
 * Opens the projects database, or explains why not.
 *
 * Without IndexedDB (unavailable, blocked, or an incompatible database) the
 * result is undefined and the editor falls back to session storage, which is
 * what it used before. On non-public stages an incompatible database is
 * reported for the UI to offer clearing it instead, since review builds share
 * one database.
 */
export const openProjectsDatabase = async (
  logging: Logging,
  publicFacing: boolean = isPublicFacingStage()
): Promise<ProjectsDatabase | undefined> => {
  if (typeof indexedDB === "undefined") {
    reportProjectStorageMode(logging, "session_no_indexeddb");
    return undefined;
  }
  try {
    const db = await ProjectsDatabase.open();
    reportProjectsDatabaseActive();
    reportProjectStorageMode(logging, "database");
    return db;
  } catch (e) {
    reportProjectStorageMode(logging, "session_open_failed");
    if (isVersionError(e) && !publicFacing) {
      reportStorageVersionError(e);
    } else {
      logging.error("Projects database unavailable, using session storage", e);
    }
    return undefined;
  }
};

/**
 * The files of a new project: the starter program.
 */
export const defaultProjectFiles = (): Record<string, Uint8Array> =>
  Object.fromEntries(
    Object.entries(defaultInitialProject.files).map(([name, base64]) => [
      name,
      toByteArray(base64),
    ])
  );

/**
 * The files of a project shared as a #project: link.
 */
export const projectLinkFiles = (
  link: ProjectLink
): Record<string, Uint8Array> => ({
  [MAIN_FILE]: new TextEncoder().encode(link.source),
});

/**
 * Decides which project the editor opens and marks it most recent.
 *
 * In order: a new project from the #project: link the app booted with; the
 * project the tab already has open, which includes one that
 * migrateSessionProject brought in; the most recently used project, so a
 * straight-to-editor bookmark keeps working; otherwise a new project.
 */
export const chooseProject = async (
  db: ProjectsDatabase,
  session: Storage | undefined,
  link?: ProjectLink
): Promise<string> => {
  if (link) {
    const id = generateId();
    await db.create(
      { id, name: link.meta.name, timestamp: Date.now() },
      projectLinkFiles(link)
    );
    setCurrentProjectId(session, id);
    return id;
  }
  const current = getCurrentProjectId(session);
  if (current && (await db.get(current))) {
    await db.touch(current);
    return current;
  }
  const recent = await db.mostRecent();
  if (recent) {
    await db.touch(recent.id);
    setCurrentProjectId(session, recent.id);
    return recent.id;
  }
  const id = generateId();
  await db.create(
    { id, name: undefined, timestamp: Date.now() },
    defaultProjectFiles()
  );
  setCurrentProjectId(session, id);
  return id;
};

/**
 * Moves the single project that the editor kept in session storage, before
 * the projects database, into the database, and makes it the tab's current
 * project, which is what it was. The session storage copy is removed so
 * this happens once. If the database write fails it is left for another
 * try.
 *
 * Only an earlier version of the app, or this one without the database,
 * writes a project to session storage, so once this has run for a page
 * load there is nothing more to find.
 *
 * @returns The new project's id, or undefined if there was none to move.
 */
export const migrateSessionProject = async (
  db: ProjectsDatabase,
  session: Storage | undefined
): Promise<string | undefined> => {
  const legacy = session && new SessionStorageFSStorage(session);
  if (!legacy || (await legacy.ls()).length === 0) {
    return undefined;
  }
  const files: Record<string, Uint8Array> = {};
  for (const name of await legacy.ls()) {
    files[name] = await legacy.read(name);
  }
  const id = generateId();
  await db.create(
    { id, name: await legacy.projectName(), timestamp: Date.now() },
    files
  );
  await legacy.removeAll();
  setCurrentProjectId(session, id);
  return id;
};

const isVersionError = (e: unknown): boolean =>
  e instanceof DOMException && e.name === "VersionError";
