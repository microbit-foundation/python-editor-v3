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
import { defaultInitialProject } from "./initial-project";
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
    return undefined;
  }
  try {
    const db = await ProjectsDatabase.open();
    reportProjectsDatabaseActive();
    return db;
  } catch (e) {
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
 * Decides which project the editor opens and marks it most recent.
 *
 * In order: the project the tab already has open; a project migrated from
 * the session-storage file system that predates the projects database, so a
 * reload after deploying this lands in the user's work; the most recently
 * used project, so a straight-to-editor bookmark keeps working; otherwise a
 * new project.
 */
export const chooseProject = async (
  db: ProjectsDatabase,
  session: Storage | undefined
): Promise<string> => {
  const current = getCurrentProjectId(session);
  if (current && (await db.get(current))) {
    await db.touch(current);
    return current;
  }
  const legacy = session && new SessionStorageFSStorage(session);
  if (legacy && (await legacy.ls()).length > 0) {
    const id = await migrateLegacyProject(db, legacy);
    setCurrentProjectId(session, id);
    return id;
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
 * Moves the single session-storage project into the database. The session
 * storage copy is removed so this happens once; the id then stands in for it.
 */
const migrateLegacyProject = async (
  db: ProjectsDatabase,
  legacy: SessionStorageFSStorage
): Promise<string> => {
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
  return id;
};

const isVersionError = (e: unknown): boolean =>
  e instanceof DOMException && e.name === "VersionError";
