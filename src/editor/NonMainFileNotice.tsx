import { BoxProps, Button, HStack, Text } from "@chakra-ui/react";
import { RiInformationLine } from "react-icons/ri";
import { MAIN_FILE } from "../fs/fs";

interface NonMainFileNoticeProps extends BoxProps {
  filename: string;
  onSelectedFileChanged: (filename: string) => void;
}

/**
 * An informational line shown when the user is editing a file other than main.py.
 *
 * We offer an additional route back to editing the main document.
 */
const NonMainFileNotice = ({
  filename,
  onSelectedFileChanged,
  ...props
}: NonMainFileNoticeProps) => {
  return (
    <HStack pl={2} pr={2} backgroundColor="whitesmoke" {...props}>
      <RiInformationLine />
      <Text fontWeight="semibold">Editing {filename}.</Text>
      <Button
        variant="unstyled"
        textDecoration="underline"
        onClick={() => onSelectedFileChanged(MAIN_FILE)}
      >
        Back to the main code.
      </Button>
    </HStack>
  );
};

export default NonMainFileNotice;
