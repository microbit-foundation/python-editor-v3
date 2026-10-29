/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createContext, use } from "react";
import { FileSystem } from "./fs";

const FileSystemContext = createContext<FileSystem | undefined>(undefined);

export const FileSystemProvider = FileSystemContext.Provider;

/**
 * Hook exposing the file system.
 *
 * Most code should use the project instead of using the file system directly.
 *
 * @returns The file system.
 */
export const useFileSystem = () => {
  const fs = use(FileSystemContext);
  if (!fs) {
    throw new Error("Missing provider");
  }
  return fs;
};
