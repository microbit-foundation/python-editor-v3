import { List, ListItem, Text, VStack } from "@chakra-ui/layout";

interface ReplaceFilesQuestionProps {
  files: string[];
}

const ReplaceFilesQuestion = ({ files }: ReplaceFilesQuestionProps) => {
  if (files.length === 1) {
    return <>Replace {files[0]}?</>;
  }
  return (
    <VStack width="100%" display="block">
      <Text>Replace {files.length} files?</Text>
      <List>
        {files.map((f) => (
          <ListItem>{f}</ListItem>
        ))}
      </List>
    </VStack>
  );
};

export default ReplaceFilesQuestion;
