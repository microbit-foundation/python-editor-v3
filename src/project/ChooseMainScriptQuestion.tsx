import { IconButton } from "@chakra-ui/button";
import { ListItem, Text, UnorderedList } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuButtonProps,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import { sortBy } from "lodash";
import { MdMoreHoriz } from "react-icons/md";
import { InputDialogBody } from "../common/InputDialog";
import { MAIN_FILE } from "../fs/fs";
import { ClassifiedFileInput, FileOperation } from "./changes";
import { MainScriptChoice } from "./project-actions";

interface ChooseMainScriptQuestionProps
  extends InputDialogBody<MainScriptChoice> {
  currentFiles: string[];
  inputs: ClassifiedFileInput[];
}

const ChooseMainScriptQuestion = ({
  currentFiles,
  inputs,
  value,
  setValue,
}: ChooseMainScriptQuestionProps) => {
  const changes = sortBy(
    findChanges(currentFiles, inputs, value.main),
    (c) => c.target !== MAIN_FILE,
    (c) => c.source
  );
  return changes.length > 1 ? (
    <UnorderedList stylePosition="inside">
      {changes.map((c) => (
        <ListItem key={c.source}>
          <FileChangeRow key={c.source} change={c} setValue={setValue} />
        </ListItem>
      ))}
    </UnorderedList>
  ) : (
    <FileChangeRow
      key={changes[0].source}
      change={changes[0]}
      setValue={setValue}
    />
  );
};

interface FileChange {
  source: string;
  target: string;
  script: boolean;
  operation: FileOperation;
  data: () => Promise<Uint8Array> | Promise<string>;
}

const findChanges = (
  currentFiles: string[],
  inputs: ClassifiedFileInput[],
  main: string | undefined
): FileChange[] => {
  const current = new Set(currentFiles);
  return inputs.map((f) => {
    const target = f.name === main ? "main.py" : f.name;
    return {
      source: f.name,
      data: f.data,
      target,
      script: f.script,
      operation: current.has(target)
        ? FileOperation.REPLACE
        : FileOperation.ADD,
    };
  });
};

const summarizeChange = (change: FileChange): string => {
  const changeText =
    change.operation === FileOperation.REPLACE ? "Replace" : "Add";
  if (change.source === change.target) {
    return `${changeText} file ${change.source}`;
  }
  const preposition =
    change.operation === FileOperation.REPLACE ? "with" : "from";
  return `${changeText} file ${change.target} ${preposition} ${change.source}`;
};

interface FileChangeRowProps {
  change: FileChange;
  setValue: (value: MainScriptChoice) => void;
}

const FileChangeRow = ({ change, setValue }: FileChangeRowProps) => {
  const clearMainScript = () => setValue({ main: undefined });
  const switchMainScript = () => setValue({ main: change.source });
  return (
    <>
      <Text as="span" lineHeight="3rem">
        {summarizeChange(change)}
      </Text>
      {change.target === MAIN_FILE && change.source !== MAIN_FILE && (
        <OptionsMenu ml={2}>
          <MenuItem onClick={clearMainScript}>
            Upload as {change.source}
          </MenuItem>
        </OptionsMenu>
      )}
      {change.script && change.target !== MAIN_FILE && (
        <OptionsMenu ml={2}>
          <MenuItem onClick={switchMainScript}>Use as main.py</MenuItem>
        </OptionsMenu>
      )}
    </>
  );
};

const OptionsMenu = ({ children, ...props }: MenuButtonProps) => {
  return (
    <Menu placement="right">
      <MenuButton
        {...props}
        as={IconButton}
        aria-label="Options"
        size="md"
        variant="outline"
        icon={<MdMoreHoriz />}
      />
      <MenuList>{children}</MenuList>
    </Menu>
  );
};

export default ChooseMainScriptQuestion;
