import { BoxProps, Button, HStack, Text } from "@chakra-ui/react";
import { MAIN_FILE } from "../fs/fs";

interface ActiveFileInfoProps extends BoxProps {
  filename: string;
  onSelectedFileChanged: (filename: string) => void;
}

/**
 * Current file info.
 *
 * We offer an additional route back to editing the main document
 * when the user is editing another document.
 */
const ActiveFileInfo = ({
  filename,
  onSelectedFileChanged,
  ...props
}: ActiveFileInfoProps) => {
  return (
    <HStack>
      <Text as="span" fontWeight="semibold">
        {filename}
      </Text>
      {filename !== MAIN_FILE && (
        <>
          <Text as="span">—</Text>
          <Button
            fontWeight="normal"
            variant="unstyled"
            textDecoration="underline"
            onClick={() => onSelectedFileChanged(MAIN_FILE)}
          >
            back to the main code
          </Button>
        </>
      )}
    </HStack>
  );
};

export default ActiveFileInfo;
