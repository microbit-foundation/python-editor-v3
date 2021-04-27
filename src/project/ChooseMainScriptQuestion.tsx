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
    findProposedChanges(currentFiles, inputs, value.main),
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

interface ProposedChange {
  source: string;
  target: string;
  script: boolean;
  module: boolean;
  operation: FileOperation;
  data: () => Promise<Uint8Array> | Promise<string>;
}

const findProposedChanges = (
  currentFiles: string[],
  inputs: ClassifiedFileInput[],
  main: string | undefined
): ProposedChange[] => {
  const current = new Set(currentFiles);
  return inputs.map((f) => {
    const target = f.name === main ? "main.py" : f.name;
    return {
      source: f.name,
      data: f.data,
      target,
      module: f.module,
      script: f.script,
      operation: current.has(target)
        ? FileOperation.REPLACE
        : FileOperation.ADD,
    };
  });
};

// Exposed for testing.
export const summarizeChange = (change: ProposedChange): string => {
  const changeText =
    change.operation === FileOperation.REPLACE ? "Replace" : "Add";
  const what = change.module ? "module" : "file";
  if (change.source === change.target && change.target !== MAIN_FILE) {
    return `${changeText} ${what} ${change.target}`;
  }
  const targetLabel =
    change.target === MAIN_FILE ? "main code" : `file ${change.target}`;
  const preposition =
    change.operation === FileOperation.REPLACE ? "with" : "from";
  return `${changeText} ${targetLabel} ${preposition} ${change.source}`;
};

interface FileChangeRowProps {
  change: ProposedChange;
  setValue: (value: MainScriptChoice) => void;
}

const FileChangeRow = ({ change, setValue }: FileChangeRowProps) => {
  const clearMainScript = () => setValue({ main: undefined });
  const switchMainScript = () => setValue({ main: change.source });
  return (
    <>
      <Text data-testid="change" as="span" lineHeight="3rem">
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
          <MenuItem onClick={switchMainScript}>Use as main code</MenuItem>
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
