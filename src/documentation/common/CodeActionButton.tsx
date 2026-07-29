/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button, Collapse, Icon } from "@microbit/ui";
import { useState } from "react";
import { RiFileCopy2Line, RiFolderOpenLine } from "react-icons/ri";
import { FormattedMessage } from "react-intl";
import { HStack } from "styled-system/jsx";

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
    <Collapse isOpen={isOpen} startingHeight={0}>
      <HStack gap="3" mt={borderAdjustment ? "2px" : "0"}>
        <Button
          onHoverStart={() => {
            toHighlighted();
            setHovered(true);
          }}
          onHoverEnd={() => {
            toDefault();
            setHovered(false);
          }}
          variant="ghost"
          size="sm"
          css={{
            fontWeight: "normal",
            color: "gray.800",
            border: "none",
            bgColor: hovered ? "blimpTeal.300" : "blimpTeal.100",
            borderTopRadius: "0",
            borderBottomRadius: "lg",
            ml: "5",
          }}
          onPress={codeAction}
          leftIcon={
            toolkitType === "ideas" ? <Icon as={RiFolderOpenLine} /> : undefined
          }
          rightIcon={
            toolkitType !== "ideas" ? <Icon as={RiFileCopy2Line} /> : undefined
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
