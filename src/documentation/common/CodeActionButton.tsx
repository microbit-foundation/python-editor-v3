import { Box, Button, Collapse, HStack } from "@chakra-ui/react";
import { useState } from "react";
import { RiFileCopy2Line, RiFolderOpenLine } from "react-icons/ri";
import { FormattedMessage } from "react-intl";
import { CopyToClipboard } from "react-copy-to-clipboard";

interface OpenButtonProps {
  toHighlighted: () => void;
  toDefault: () => void;
  codeAction: () => void;
}

interface CopyButtonProps extends OpenButtonProps {
  toHighlighted: () => void;
  toDefault: () => void;
  codeAction: () => void;
  codeToCopy: string;
}

interface CodeActionButtonProps extends CopyButtonProps {
  isOpen: boolean;
  borderAdjustment: boolean;
  toolkitType?: string;
}

const CodeActionButton = ({
  isOpen,
  borderAdjustment,
  toolkitType,
  ...props
}: CodeActionButtonProps) => {
  return (
    <Collapse in={isOpen} startingHeight={0}>
      <HStack spacing={3} mt={borderAdjustment ? "2px" : 0}>
        {toolkitType === "ideas" ? (
          <OpenButton {...props} />
        ) : (
          <CopyButton {...props} />
        )}
      </HStack>
    </Collapse>
  );
};

const CopyButton = ({
  toHighlighted,
  toDefault,
  codeAction,
  codeToCopy,
}: CopyButtonProps) => {
  const [hovered, setHovered] = useState<boolean>(false);
  return (
    <CopyToClipboard text={codeToCopy}>
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
        rightIcon={<Box as={RiFileCopy2Line} />}
      >
        <FormattedMessage id="copy-code-action" />
      </Button>
    </CopyToClipboard>
  );
};

const OpenButton = ({
  toHighlighted,
  toDefault,
  codeAction,
}: OpenButtonProps) => {
  const [hovered, setHovered] = useState<boolean>(false);
  return (
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
      leftIcon={<Box as={RiFolderOpenLine} />}
    >
      <FormattedMessage id="open-action" />
    </Button>
  );
};

export default CodeActionButton;
