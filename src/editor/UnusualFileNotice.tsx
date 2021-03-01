import { BoxProps, Button, HStack, Text } from "@chakra-ui/react";
import { RiInformationLine } from "react-icons/ri";
import { MAIN_FILE } from "../fs/fs";

interface UnusualFileNoticeProps extends BoxProps {
  filename: string;
  onSelectedFileChanged: (filename: string) => void;
}

const UnusualFileNotice = ({
  filename,
  onSelectedFileChanged,
  ...props
}: UnusualFileNoticeProps) => {
  return (
    <HStack pl={2} pr={2} backgroundColor="whitesmoke" {...props}>
      <RiInformationLine />
      <Text fontWeight="semibold">Currently editing {filename}.</Text>
      <Button
        variant="unstyled"
        textDecoration="underline"
        onClick={() => onSelectedFileChanged(MAIN_FILE)}
      >
        Back to the main script.
      </Button>
    </HStack>
  );
};

export default UnusualFileNotice;
