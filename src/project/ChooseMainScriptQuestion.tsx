/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
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
import sortBy from "lodash.sortby";
import { RiFileSettingsLine } from "react-icons/ri";
import { IntlShape, useIntl } from "react-intl";
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
export const summarizeChange = (
  intl: IntlShape,
  change: ProposedChange
): string => {
  const changeType =
    change.operation === FileOperation.REPLACE ? "replace" : "add";
  const moduleNature = change.module ? "module" : "file";
  if (change.source === change.target && change.target !== MAIN_FILE) {
    return intl.formatMessage(
      { id: `choose-main-${changeType}-${moduleNature}` },
      { name: change.target }
    );
  }
  const targetType = change.target === MAIN_FILE ? "main-code" : `file`;
  const id = `choose-main-source-${changeType}-${targetType}`;
  return intl.formatMessage(
    { id },
    {
      source: change.source,
      target: change.target,
    }
  );
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
  const intl = useIntl();
  return (
    <HStack justifyContent="space-between">
      <Text data-testid="change" as="span" lineHeight="3rem">
        {summarizeChange(intl, change)}
      </Text>
      {change.script && change.source !== MAIN_FILE && (
        <OptionsMenu ml="auto">
          <MenuOptionGroup
            value={isMainScript ? "main" : "source"}
            title={change.source}
            type="radio"
          >
            <MenuItemOption value="main" onClick={switchMainScript}>
              {summarizeChange(intl, {
                ...change,
                target: MAIN_FILE,
                operation: currentFiles.has(MAIN_FILE)
                  ? FileOperation.REPLACE
                  : FileOperation.ADD,
              })}
            </MenuItemOption>
            <MenuItemOption value="source" onClick={clearMainScript}>
              {summarizeChange(intl, {
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
  const intl = useIntl();
  return (
    <Menu placement="right">
      <MenuButton
        {...props}
        as={IconButton}
        colorScheme="gray"
        aria-label={intl.formatMessage({ id: "options" })}
        size="md"
        variant="ghost"
        icon={<RiFileSettingsLine />}
      />
      <MenuList>{children}</MenuList>
    </Menu>
  );
};

export default ChooseMainScriptQuestion;
