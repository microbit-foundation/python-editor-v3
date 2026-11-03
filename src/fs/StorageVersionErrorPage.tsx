/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button, Text } from "@microbit/ui";
import { ErrorPage } from "@microbit/ui-patterns";
import {
  getCurrentProjectId,
  sessionStorageIfPossible,
} from "./current-project";
import { databaseName } from "./projects-db";

const deleteDatabase = (name: string) =>
  new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () =>
      reject(request.error ?? new Error("deleteDatabase failed"));
  });

/**
 * Shown on non-public stages when the projects database was created by an
 * incompatible build. Review builds share one database, so this is expected
 * to happen there now and then; the fix is to start again.
 *
 * Deliberately untranslated: it never appears on a public deployment.
 */
const StorageVersionErrorPage = () => {
  const handleClearAndReload = async () => {
    try {
      await deleteDatabase(databaseName());
    } catch {
      // Best effort; the reload will show this page again if it failed.
    }
    const session = sessionStorageIfPossible();
    if (session && getCurrentProjectId(session)) {
      session.removeItem("currentProjectId");
    }
    window.location.reload();
  };
  return (
    <ErrorPage title="Breaking change to stored data">
      <Text>
        The project storage format has changed in this pre-release version and
        the old data is not supported. Clearing removes every project stored by
        review builds in this browser.
      </Text>
      <Button variant="primary" onPress={handleClearAndReload}>
        Clear data and reload
      </Button>
    </ErrorPage>
  );
};

export default StorageVersionErrorPage;
