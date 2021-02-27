import { Text } from "@codemirror/state";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { EVENT_STATE, FileSystemState, FileSystem, MAIN_FILE } from "./fs";

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

export const useFileSystemState = (): FileSystemState | undefined => {
  const fs = useFileSystem();
  const [state, setState] = useState<FileSystemState | undefined>(undefined);
  useEffect(() => {
    if (fs) {
      setState(fs.state);
      fs.on(EVENT_STATE, setState);
      return () => {
        fs.removeListener(EVENT_STATE, setState);
      };
    }
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
      // Hmm. We could queue them / debounce here?
      // What happens if we fill up the file system?
      fs.write(filename, content);
    },
    [fs]
  );

  return [initialValue, handleChange];
};
