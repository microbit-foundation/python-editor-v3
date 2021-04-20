import { List, ListItem, VStack } from "@chakra-ui/layout";
import { Select } from "@chakra-ui/react";
import { FileChange, FileOperation, FileInput, findChanges } from "./changes";

interface ChooseMainScriptQuestionProps {
  currentFiles: string[];
  candidateScripts: FileInput[];
  otherFiles: FileInput[];
  chosenScript: string | undefined;
  onChosenScriptChange: (script: string) => void;
}

const ChooseMainScriptQuestion = ({
  currentFiles,
  candidateScripts,
  otherFiles,
  chosenScript,
  onChosenScriptChange,
}: ChooseMainScriptQuestionProps) => {
  const changes = findChanges(currentFiles, [
    ...candidateScripts.filter((x) => x.name !== chosenScript),
    ...otherFiles,
  ]);
  return (
    <VStack width="100%" display="block">
      <Select
        placeholder="Select main script"
        onChange={(e) => onChosenScriptChange(e.target.value)}
      >
        {candidateScripts.map((script) => (
          <option
            selected={Boolean(chosenScript) && script.name === chosenScript}
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
