import { BoxProps, Button, HStack, Text } from "@chakra-ui/react";
import { RiInformationLine } from "react-icons/ri";
import { MAIN_FILE } from "../fs/fs";
import { FileVersion } from "../fs/storage";

interface NonMainFileNoticeProps extends BoxProps {
  file: FileVersion;
  onSelectedFileChanged: (filename: string) => void;
}

/**
 * An informational line shown when the user is editing a file other than main.py.
 *
 * We offer an additional route back to editing the main document.
 */
const NonMainFileNotice = ({
  file,
  onSelectedFileChanged,
  ...props
}: NonMainFileNoticeProps) => {
  return (
    <HStack pl={2} pr={2} backgroundColor="whitesmoke" {...props}>
      <RiInformationLine />
      <Text fontWeight="semibold">Editing {file.name}.</Text>
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

export default NonMainFileNotice;
