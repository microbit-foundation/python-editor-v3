import { ListItem, Text, UnorderedList, VStack } from "@chakra-ui/layout";
import { Select } from "@chakra-ui/react";
import { InputDialogBody } from "../common/InputDialog";
import { FileChange, FileInput, FileOperation, findChanges } from "./changes";
import { MainScriptChoice } from "./project-actions";

interface ChooseMainScriptQuestionProps
  extends InputDialogBody<MainScriptChoice> {
  currentFiles: string[];
  candidateScripts: FileInput[];
  otherFiles: FileInput[];
}

const ChooseMainScriptQuestion = ({
  currentFiles,
  candidateScripts,
  otherFiles,
  value,
  setValue,
}: ChooseMainScriptQuestionProps) => {
  const changes = findChanges(currentFiles, [
    ...candidateScripts.filter((x) => x.name !== value.main),
    ...otherFiles,
  ]);
  const hasScriptChoices = candidateScripts.length > 0;
  return (
    <VStack alignItems="stretch" spacing="5">
      {hasScriptChoices && (
        <VStack alignItems="stretch">
          <Text fontSize="md">Select script to replace main.py</Text>
          <Select
            placeholder="None (keep current main.py)"
            onChange={(e) => setValue({ main: e.target.value })}
          >
            {candidateScripts.map((script) => (
              <option
                selected={Boolean(value) && script.name === value.main}
                value={script.name}
              >
                {script.name}
              </option>
            ))}
          </Select>
        </VStack>
      )}
      {changes.length > 0 && (
        <VStack alignItems="stretch">
          {hasScriptChoices && (
            <Text fontSize="md">Other files to be added or updated</Text>
          )}
          <UnorderedList stylePosition="inside">
            {changes.map((c) => (
              <ListItem key={c.name}>{summarizeChange(c)}</ListItem>
            ))}
          </UnorderedList>
        </VStack>
      )}
    </VStack>
  );
};

const summarizeChange = (change: FileChange): string => {
  const changeText =
    change.operation === FileOperation.REPLACE ? "Update" : "Add";
  return `${changeText} file ${change.name}`;
};

export default ChooseMainScriptQuestion;
