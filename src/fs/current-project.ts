/**
 * Which project the editor opens, and its storage.
 *
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { isPublicFacingStage } from "../environment";
import { Logging } from "../logging/logging";
import { generateId } from "./fs-util";
import { IndexedDBFSStorage } from "./indexeddb-storage";
import { ProjectsDatabase } from "./projects-db";
import { FSStorage, SessionStorageFSStorage } from "./storage";
import { reportStorageVersionError } from "./storage-status";

/**
 * The open project is per tab, as the whole project used to be.
 */
const currentProjectKey = "currentProjectId";

export const getCurrentProjectId = (
  session: Storage | undefined
): string | undefined => session?.getItem(currentProjectKey) ?? undefined;

export const setCurrentProjectId = (
  session: Storage | undefined,
  id: string
): void => session?.setItem(currentProjectKey, id);

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
 * Opens the storage for the tab's current project.
 *
 * In order: the project the tab already has open; a project migrated from
 * the session-storage file system that predates the library, so a reload
 * after deploying this lands in the user's work; otherwise a new project.
 *
 * Without IndexedDB (unavailable, blocked, or an incompatible database) this
 * falls back to session storage, which is what the editor used before. On
 * non-public stages an incompatible database is reported for the UI to offer
 * clearing it instead, since review builds share one library.
 */
export const openCurrentProjectStorage = async (
  logging: Logging,
  publicFacing: boolean = isPublicFacingStage()
): Promise<FSStorage | undefined> => {
  if (typeof indexedDB === "undefined") {
    return SessionStorageFSStorage.create();
  }
  let db: ProjectsDatabase;
  try {
    db = await ProjectsDatabase.open();
  } catch (e) {
    if (isVersionError(e) && !publicFacing) {
      reportStorageVersionError(e);
      return undefined;
    }
    logging.error("Project library unavailable, using session storage", e);
    return SessionStorageFSStorage.create();
  }
  const session = sessionStorageIfPossible();
  const id = await chooseProject(db, session);
  return new IndexedDBFSStorage(db, id, (e) =>
    logging.error("Failed to save project", e)
  );
};

const chooseProject = async (
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
  const id = generateId();
  await db.create(
    { id, name: undefined, timestamp: Date.now(), dirty: false },
    {}
  );
  setCurrentProjectId(session, id);
  return id;
};

/**
 * Moves the single session-storage project into the library. The session
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
    {
      id,
      name: await legacy.projectName(),
      timestamp: Date.now(),
      dirty: await legacy.isDirty(),
    },
    files
  );
  await legacy.removeAll();
  return id;
};

const isVersionError = (e: unknown): boolean =>
  e instanceof DOMException && e.name === "VersionError";
