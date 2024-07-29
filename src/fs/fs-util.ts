/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

export const getFileExtension = (filename: string): string | undefined => {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop() || undefined : undefined;
};

export const getLowercaseFileExtension = (
  filename: string
): string | undefined => {
  return getFileExtension(filename)?.toLowerCase();
};

/**
 * Reads file as text via a FileReader.
 *
 * @param file A file (e.g. from a file input or drop operation).
 * @returns The a promise of text from that file.
 */
export const readFileAsText = async (file: File): Promise<string> => {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = (e: ProgressEvent<FileReader>) => {
      resolve(e.target!.result as string);
    };
    reader.onerror = (e: ProgressEvent<FileReader>) => {
      const error = e.target?.error || new Error("Error reading file as text");
      reject(error);
    };
    reader.readAsText(file);
  });
};

/**
 * Reads file as text via a FileReader.
 *
 * @param file A file (e.g. from a file input or drop operation).
 * @returns The a promise of text from that file.
 */
export const readFileAsUint8Array = async (file: File): Promise<Uint8Array> => {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = (e: ProgressEvent<FileReader>) => {
      resolve(new Uint8Array(e.target!.result as ArrayBuffer));
    };
    reader.onerror = (e: ProgressEvent<FileReader>) => {
      const error = e.target?.error || new Error("Error reading file");
      reject(error);
    };
    reader.readAsArrayBuffer(file);
  });
};

const magicModuleComment = "# microbit-module:";

const findMagicModuleComment = (code: string): string | undefined => {
  const codeLines = code.split(/\r?\n/);
  const firstThreeLines = codeLines.slice(0, 3);
  return firstThreeLines.find((line) => line.indexOf(magicModuleComment) === 0);
};

/**
 * Detect a module using the magic comment.
 */
export const isPythonMicrobitModule = (code: string | Uint8Array) => {
  if (code instanceof Uint8Array) {
    code = new TextDecoder().decode(code);
  }
  return Boolean(findMagicModuleComment(code));
};

export interface ModuleData {
  name: string;
  version: string;
}

export const extractModuleData = (code: string): ModuleData | undefined => {
  const line = findMagicModuleComment(code);
  if (!line) {
    return;
  }
  const nameAndVersion = line.replace(magicModuleComment, "").trim().split("@");
  return {
    name: nameAndVersion[0],
    version: nameAndVersion[1],
  };
};

export const generateId = () =>
  Math.random().toString(36).substring(2) +
  Math.random().toString(36).substring(2);
