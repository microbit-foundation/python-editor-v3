export enum FileOperation {
  REPLACE,
  ADD,
}

export interface FileInput {
  name: string;
  data: () => Promise<Uint8Array> | Promise<string>;
}

export interface FileChange extends FileInput {
  operation: FileOperation;
}

export const findChanges = (
  currentFiles: string[],
  proposedFiles: FileInput[]
): FileChange[] => {
  const current = new Set(currentFiles);
  return proposedFiles.map((f) => ({
    ...f,
    operation: current.has(f.name) ? FileOperation.REPLACE : FileOperation.ADD,
  }));
};
