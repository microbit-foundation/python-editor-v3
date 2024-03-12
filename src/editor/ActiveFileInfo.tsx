/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps, Button, HStack, Text } from "@chakra-ui/react";
import { FormattedMessage } from "react-intl";
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
}: ActiveFileInfoProps) => {
  return (
    <HStack>
      {filename !== MAIN_FILE && (
        <>
          <Text
            as="span"
            fontWeight="semibold"
            maxWidth="15ch"
            textOverflow="ellipsis"
            overflowX="hidden"
            whiteSpace="nowrap"
          >
            {filename}
          </Text>
          <Text as="span">—</Text>
          <Button
            fontWeight="normal"
            variant="unstyled"
            textDecoration="underline"
            onClick={() => onSelectedFileChanged(MAIN_FILE)}
          >
            <FormattedMessage id="back-to-main" />
          </Button>
        </>
      )}
    </HStack>
  );
};

export default ActiveFileInfo;
