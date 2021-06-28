/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

export enum FileOperation {
  REPLACE,
  ADD,
}

export interface FileInput {
  name: string;
  data: () => Promise<Uint8Array> | Promise<string>;
}

export interface ClassifiedFileInput extends FileInput {
  /**
   * Whether this file is a candidate to be the "main.py" script.
   */
  script: boolean;
  /**
   * Whether this candidate is marked as a micro:bit module file with a special comment.
   * Other Python module files are possible, but this marker clearly identifies the file
   * as a module and we discount it as a potential script.
   */
  module: boolean;
}

export interface FileChange extends FileInput {
  operation: FileOperation;
}
