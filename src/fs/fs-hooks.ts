import { Text } from "@codemirror/state";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import useIsUnmounted from "../common/use-is-unmounted";
import { EVENT_STATE, FileSystem, Project } from "./fs";

export const FileSystemContext = createContext<FileSystem | undefined>(
  undefined
);

export const useFileSystem = () => {
  const fs = useContext(FileSystemContext);
  if (!fs) {
    throw new Error("Missing provider");
  }
  return fs;
};

export const useProject = (): Project => {
  const fs = useFileSystem();
  const isUnmounted = useIsUnmounted();
  const [state, setState] = useState<Project>(fs.state);
  useEffect(() => {
    const listener = (x: any) => {
      if (!isUnmounted()) {
        setState(x);
      }
    };
    fs.on(EVENT_STATE, listener);
    return () => {
      fs.removeListener(EVENT_STATE, listener);
    };
  }, [fs]);
  return state;
};

/**
 * Reads an initial value from the file system and synchronises back to it.
 */
export const useFileSystemBackedText = (
  filename: string
): [Text | undefined, (text: Text) => void] => {
  const fs = useFileSystem();
  const [initialValue, setInitialValue] = useState<Text | undefined>();

  useEffect(() => {
    const string = fs.read(filename);
    setInitialValue(Text.of(string.split("\n")));
  }, [fs]);

  const handleChange = useCallback(
    (text: Text) => {
      const content = text.sliceString(0, undefined, "\n");
      // If we fill up the FS it seems to cope and error when we
      // ask for a hex.
      fs.write(filename, content);
    },
    [fs]
  );

  return [initialValue, handleChange];
};
