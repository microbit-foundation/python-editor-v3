import { IconButton } from "@chakra-ui/button";
import { HStack, ListItem, Text, UnorderedList } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuButtonProps,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
} from "@chakra-ui/menu";
import { sortBy } from "lodash";
import { RiFileSettingsLine } from "react-icons/ri";
import { InputDialogBody } from "../common/InputDialog";
import { MAIN_FILE } from "../fs/fs";
import { ClassifiedFileInput, FileOperation } from "./changes";
import { MainScriptChoice } from "./project-actions";

interface ChooseMainScriptQuestionProps
  extends InputDialogBody<MainScriptChoice> {
  currentFiles: Set<string>;
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
    <UnorderedList listStyleType="none" listStylePos="inside" m={0}>
      {changes.map((c) => (
        <ListItem key={c.source}>
          <FileChangeRow
            key={c.source}
            change={c}
            setValue={setValue}
            currentFiles={currentFiles}
          />
        </ListItem>
      ))}
    </UnorderedList>
  ) : (
    <FileChangeRow
      key={changes[0].source}
      change={changes[0]}
      setValue={setValue}
      currentFiles={currentFiles}
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
  currentFiles: Set<string>,
  inputs: ClassifiedFileInput[],
  main: string | undefined
): ProposedChange[] => {
  return inputs.map((f) => {
    const target = f.name === main ? "main.py" : f.name;
    return {
      source: f.name,
      data: f.data,
      target,
      module: f.module,
      script: f.script,
      operation: currentFiles.has(target)
        ? FileOperation.REPLACE
        : FileOperation.ADD,
    };
  });
};

// Exposed for testing.
export const summarizeChange = (change: ProposedChange): string => {
  const changeText =
    // come back later, property , expected
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
  currentFiles: Set<string>;
}

const FileChangeRow = ({
  change,
  setValue,
  currentFiles,
}: FileChangeRowProps) => {
  const clearMainScript = () => setValue({ main: undefined });
  const switchMainScript = () => setValue({ main: change.source });
  const isMainScript = change.target === MAIN_FILE;
  return (
    <HStack justifyContent="space-between">
      <Text data-testid="change" as="span" lineHeight="3rem">
        {summarizeChange(change)}
      </Text>
      {change.script && change.source !== MAIN_FILE && (
        <OptionsMenu ml="auto">
          <MenuOptionGroup
            value={isMainScript ? "main" : "source"}
            title={change.source}
            type="radio"
          >
            <MenuItemOption value="main" onClick={switchMainScript}>
              {summarizeChange({
                ...change,
                target: MAIN_FILE,
                operation: currentFiles.has(MAIN_FILE)
                  ? FileOperation.REPLACE
                  : FileOperation.ADD,
              })}
            </MenuItemOption>
            <MenuItemOption value="source" onClick={clearMainScript}>
              {summarizeChange({
                ...change,
                target: change.source,
                operation: currentFiles.has(change.source)
                  ? FileOperation.REPLACE
                  : FileOperation.ADD,
              })}
            </MenuItemOption>
          </MenuOptionGroup>
        </OptionsMenu>
      )}
    </HStack>
  );
};

const OptionsMenu = ({ children, ...props }: MenuButtonProps) => {
  return (
    <Menu placement="right">
      <MenuButton
        {...props}
        as={IconButton}
        colorScheme="gray"
        aria-label="Options"
        size="md"
        variant="ghost"
        icon={<RiFileSettingsLine />}
      />
      <MenuList>{children}</MenuList>
    </Menu>
  );
};

export default ChooseMainScriptQuestion;
