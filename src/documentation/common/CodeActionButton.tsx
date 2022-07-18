/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Button, Collapse, HStack } from "@chakra-ui/react";
import { useState } from "react";
import { RiFileCopy2Line, RiFolderOpenLine } from "react-icons/ri";
import { FormattedMessage } from "react-intl";

interface CodeActionButtonProps {
  isOpen: boolean;
  toHighlighted: () => void;
  toDefault: () => void;
  codeAction: () => void;
  borderAdjustment: boolean;
  toolkitType?: string;
}

const CodeActionButton = ({
  isOpen,
  toHighlighted,
  toDefault,
  codeAction,
  borderAdjustment,
  toolkitType,
}: CodeActionButtonProps) => {
  const [hovered, setHovered] = useState<boolean>(false);
  return (
    <Collapse in={isOpen} startingHeight={0}>
      <HStack spacing={3} mt={borderAdjustment ? "2px" : 0}>
        <Button
          onMouseEnter={() => {
            toHighlighted();
            setHovered(true);
          }}
          onMouseLeave={() => {
            toDefault();
            setHovered(false);
          }}
          fontWeight="normal"
          color="gray.800"
          border="none"
          bgColor={hovered ? "blimpTeal.300" : "blimpTeal.100"}
          borderTopRadius="0"
          borderBottomRadius="lg"
          ml={5}
          variant="ghost"
          size="sm"
          onClick={codeAction}
          leftIcon={
            toolkitType === "ideas" ? <Box as={RiFolderOpenLine} /> : undefined
          }
          rightIcon={
            toolkitType !== "ideas" ? <Box as={RiFileCopy2Line} /> : undefined
          }
        >
          <FormattedMessage
            id={toolkitType === "ideas" ? "open-action" : "copy-code-action"}
          />
        </Button>
      </HStack>
    </Collapse>
  );
};

export default CodeActionButton;
