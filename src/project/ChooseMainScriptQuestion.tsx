import { Button } from "@chakra-ui/button";
import { ListItem, UnorderedList, HStack, Text } from "@chakra-ui/layout";
import { InputDialogBody } from "../common/InputDialog";
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
  const changes = findChanges(currentFiles, inputs, value.main);

  // Aiming for:
  // - Replace main.py with samplefile.py [Upload as samplefile.py]
  // - Add file otherfile.py [Use as main.py]
  // - Replace file module.py
  // - Add file whatever.txt

  return (
    <UnorderedList stylePosition="inside">
      {changes.map((c) => (
        <ListItem key={c.source}>
          <FileChangeRow change={c} setValue={setValue} />
        </ListItem>
      ))}
    </UnorderedList>
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
    change.operation === FileOperation.REPLACE ? "Update" : "Add";
  if (change.source === change.target) {
    return `${changeText} file ${change.source}`;
  }
  const preposition =
    change.operation === FileOperation.REPLACE ? "with" : "from";
  return `${changeText} file  ${preposition} ${change.source}`;
};

interface FileChangeRowProps {
  change: FileChange;
  setValue: (value: MainScriptChoice) => void;
  // switchMain: (newMain: String) => void;
}

const FileChangeRow = ({ change, setValue }: FileChangeRowProps) => {
  const clearMainScript = () => setValue({ main: undefined });
  const switchMainScript = () => setValue({ main: change.source });
  return (
    <HStack>
      <Text>{summarizeChange(change)}</Text>
      {change.target === "main.py" && (
        <Button size="sm" variant="outline" onClick={clearMainScript}>
          Upload as {change.source}
        </Button>
      )}
      {change.script && change.target !== "main.py" && (
        <Button size="sm" variant="outline" onClick={switchMainScript}>
          Use as main.py
        </Button>
      )}
    </HStack>
  );
};

export default ChooseMainScriptQuestion;
