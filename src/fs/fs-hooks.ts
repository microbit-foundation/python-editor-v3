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

export const useInitializedFileSystem = () => {
  const fs = useContext(FileSystemContext);
  const [initialized, setInitialized] = useState(false);
  if (!fs) {
    throw new Error("Missing provider");
  }
  useEffect(() => {
    const initialize = async () => {
      await fs.initialize();
      setInitialized(true);
    };
    initialize();
  }, [fs]);
  return initialized ? fs : null;
};

export const useFileSystemState = (): FileSystemState | undefined => {
  const fs = useInitializedFileSystem();
  const [state, setState] = useState<FileSystemState | undefined>(undefined);
  useEffect(() => {
    if (fs) {
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
 *
 * The initial value will be `undefined` until the file system is initialized.
 */
export const useFileSystemBackedText = (
  filename: string
): [Text | undefined, (text: Text) => void] => {
  const fs = useInitializedFileSystem();
  const [initialValue, setInitialValue] = useState<Text | undefined>();

  useEffect(() => {
    if (fs) {
      const string = fs.read(filename);
      setInitialValue(Text.of(string.split("\n")));
    }
  }, [fs]);

  const handleChange = useCallback(
    (text: Text) => {
      const content = text.sliceString(0, undefined, "\n");
      localStorage.setItem("text", content);
      // Hmm. We could queue them / debounce here?
      // What happens if we fill up the file system?
      // The FS library barfs on empty files!
      const hack = content.length === 0 ? "\n" : content;
      if (fs) {
        fs.write(MAIN_FILE, hack);
      }
    },
    [fs]
  );

  return [initialValue, handleChange];
};
