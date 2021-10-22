/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  BoxProps,
  Button,
  HStack,
  IconButton,
  useDisclosure,
} from "@chakra-ui/react";
import { useCallback } from "react";
import { RiInformationLine } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import ExpandCollapseIcon from "../common/ExpandCollapseIcon";
import { useDeviceTraceback } from "../device/device-hooks";
import { SerialHelpDialog } from "./SerialHelp";
import SerialIndicators from "./SerialIndicators";
import SerialMenu from "./SerialMenu";

interface SerialBarProps extends BoxProps {
  compact?: boolean;
  onSizeChange: (size: "compact" | "open") => void;
}

/**
 * The bar at the top of the serial area exposing serial status and actions.
 */
const SerialBar = ({
  compact,
  onSizeChange,
  background,
  ...props
}: SerialBarProps) => {
  const handleExpandCollapseClick = useCallback(() => {
    onSizeChange(compact ? "open" : "compact");
  }, [compact, onSizeChange]);
  const intl = useIntl();
  const helpDisclosure = useDisclosure();
  const traceback = useDeviceTraceback();
  return (
    <>
      <SerialHelpDialog
        isOpen={helpDisclosure.isOpen}
        onClose={helpDisclosure.onClose}
      />
      <HStack
        justifyContent="space-between"
        p={1}
        backgroundColor={traceback && "code.error"}
        {...props}
      >
        <SerialIndicators
          compact={compact}
          traceback={traceback}
          overflow="hidden"
        />

        <HStack>
          <Button
            variant="unstyled"
            display="flex"
            fontWeight="normal"
            color="white"
            onClick={handleExpandCollapseClick}
            rightIcon={<ExpandCollapseIcon open={Boolean(compact)} />}
          >
            <FormattedMessage
              id={compact ? "serial-expand" : "serial-collapse"}
            />
          </Button>
          <HStack spacing="0.5">
            <IconButton
              variant="sidebar"
              color="white"
              isRound
              aria-label={intl.formatMessage({ id: "hints-and-tips" })}
              icon={<RiInformationLine />}
              onClick={helpDisclosure.onOpen}
            />
            <SerialMenu compact={compact} onSizeChange={onSizeChange} />
          </HStack>
        </HStack>
      </HStack>
    </>
  );
};

export default SerialBar;
