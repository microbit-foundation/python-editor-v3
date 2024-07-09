/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { CreateFile, DeleteFile } from "vscode-languageserver-protocol";
import { FileSystem, Project, ProjectUpdatedEvent, diff } from "../fs/fs";
import { isPythonFile } from "../project/project-utils";
import { LanguageServerClient, createUri } from "./client";
import { isErrorDueToDispose } from "./error-util";

export type FsChangesListener = (event: ProjectUpdatedEvent) => any;

/**
 * Updates the language server open files as the file system
 * changes.
 *
 * @param client The language server client.
 * @param fs The file system.
 */
export const trackFsChanges = (
  client: LanguageServerClient,
  fs: FileSystem
): FsChangesListener => {
  let previous: Project = {
    ...fs.project,
    // Start with no files for the diff, regardless of where the file
    // system initialization has got to so we open everything.
    files: [],
  };
  const documentText = async (name: string) =>
    new TextDecoder().decode((await fs.read(name)).data);
  const diffAndUpdateClient = async (event: ProjectUpdatedEvent) => {
    const current = event.project;
    const changes = diff(previous, current).filter((c) => isPythonFile(c.name));
    previous = current;
    try {
      for (const change of changes) {
        const uri = createUri(change.name);
        switch (change.type) {
          case "create": {
            const params: CreateFile = {
              uri,
              kind: "create",
            };
            client.connection.sendNotification("pyright/createFile", params);
            client.didOpenTextDocument({
              textDocument: {
                languageId: "python",
                text: await documentText(change.name),
                uri,
              },
            });
            break;
          }
          case "delete": {
            const params: DeleteFile = {
              uri,
              kind: "delete",
            };
            client.connection.sendNotification("pyright/deleteFile", params);
            client.didCloseTextDocument({
              textDocument: {
                uri,
              },
            });
            break;
          }
          case "edit": {
            // This is only when a document is entirely changed. Open documents are handled
            // by the editor language server client integration and don't result in project
            // file version changes.
            client.didChangeTextDocument(uri, [
              {
                text: await documentText(change.name),
              },
            ]);
            break;
          }
          default:
            throw new Error("Unexpected change: " + change.type);
        }
      }
    } catch (e) {
      if (!isErrorDueToDispose(e)) {
        throw e;
      }
    }
  };
  fs.addEventListener("project_updated", diffAndUpdateClient);
  diffAndUpdateClient(new ProjectUpdatedEvent(fs.project));
  return diffAndUpdateClient;
};

export const removeTrackFsChangesListener = (
  fs: FileSystem,
  listener: FsChangesListener
): void => {
  fs.removeEventListener("project_updated", listener);
};
