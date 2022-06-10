import { Box, Button, Collapse, HStack } from "@chakra-ui/react";
import { useState } from "react";
import { RiFileCopy2Line } from "react-icons/ri";
import { FormattedMessage } from "react-intl";

interface CopyCodeButtonProps {
  isOpen: boolean;
  toHighlighted: () => void;
  toDefault: () => void;
  handleCopyCode: () => void;
  borderAdjustment: boolean;
}

const CopyCodeButton = ({
  isOpen,
  toHighlighted,
  toDefault,
  handleCopyCode,
  borderAdjustment,
}: CopyCodeButtonProps) => {
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
          onClick={handleCopyCode}
          rightIcon={<Box as={RiFileCopy2Line} />}
        >
          <FormattedMessage id="copy-code-action" />
        </Button>
      </HStack>
    </Collapse>
  );
};

export default CopyCodeButton;
