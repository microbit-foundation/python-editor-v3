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
import { useIntl } from "react-intl";
import ExpandCollapseIcon from "../common/ExpandCollapseIcon";
import { SerialHelpDialog } from "./SerialHelp";
import SerialIndicators from "./SerialIndicators";
import SerialMenu from "./SerialMenu";

interface SerialBarProps extends BoxProps {
  compact?: boolean;
  onSizeChange: (size: "compact" | "open") => void;
}

const SerialBar = ({ compact, onSizeChange, ...props }: SerialBarProps) => {
  const handleExpandCollapseClick = useCallback(() => {
    onSizeChange(compact ? "open" : "compact");
  }, [compact, onSizeChange]);
  const intl = useIntl();
  const helpDisclosure = useDisclosure();
  return (
    <>
      <SerialHelpDialog
        isOpen={helpDisclosure.isOpen}
        onClose={helpDisclosure.onClose}
      />
      <HStack justifyContent="space-between" p={1} {...props}>
        <SerialIndicators compact={compact} overflow="hidden" />

        <HStack>
          <Button
            variant="unstyled"
            fontWeight="normal"
            textDecoration="underline"
            color="white"
            onClick={helpDisclosure.onOpen}
          >
            Hints and tips
          </Button>
          <HStack spacing={0}>
            <IconButton
              variant="sidebar"
              color="white"
              isRound
              aria-label={
                compact
                  ? intl.formatMessage({ id: "serial-expand" })
                  : intl.formatMessage({ id: "serial-collapse" })
              }
              icon={<ExpandCollapseIcon open={Boolean(compact)} />}
              onClick={handleExpandCollapseClick}
            />
            <SerialMenu
              compact={compact}
              onSizeChange={onSizeChange}
              onOpenHelp={helpDisclosure.onOpen}
            />
          </HStack>
        </HStack>
      </HStack>
    </>
  );
};

export default SerialBar;
