import { List, ListItem, VStack } from "@chakra-ui/layout";
import { Select } from "@chakra-ui/react";
import { FileChange, FileOperation, FileInput, findChanges } from "./changes";
import { InputDialogBody } from "../common/InputDialog";

interface ChooseMainScriptQuestionProps
  extends InputDialogBody<string | undefined> {
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
    ...candidateScripts.filter((x) => x.name !== value),
    ...otherFiles,
  ]);
  return (
    <VStack width="100%" display="block">
      <Select
        placeholder="Select main script"
        onChange={(e) => setValue(e.target.value)}
      >
        {candidateScripts.map((script) => (
          <option
            selected={Boolean(value) && script.name === value}
            value={script.name}
          >
            {script.name}
          </option>
        ))}
      </Select>
      <List>
        {changes.map((c) => (
          <ListItem key={c.name}>{summarizeChange(c)}</ListItem>
        ))}
      </List>
    </VStack>
  );
};

const summarizeChange = (change: FileChange): string => {
  const changeText =
    change.operation === FileOperation.REPLACE ? "Update" : "Add";
  return `${changeText} file ${change.name}`;
};

export default ChooseMainScriptQuestion;
