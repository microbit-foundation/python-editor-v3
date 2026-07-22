/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps, HStack, IconButton, useDisclosure } from "@chakra-ui/react";
import { useCallback, useRef } from "react";
import {
  RiChat1Line,
  RiInformationLine,
  RiTerminalBoxLine,
} from "react-icons/ri";
import { useIntl } from "react-intl";
import CollapsibleButton from "../common/CollapsibleButton";
import ExpandCollapseIcon from "../common/ExpandCollapseIcon";
import {
  SyncStatus,
  useDeviceTraceback,
  useSyncStatus,
} from "../device/device-hooks";
import { useLogging } from "../logging/logging-hooks";
import { SerialHelpDialog } from "./SerialHelp";
import SerialIndicators from "./SerialIndicators";
import SerialMenu from "./SerialMenu";

interface SerialBarProps extends BoxProps {
  compact?: boolean;
  onSizeChange: (size: "compact" | "open") => void;
  showSyncStatus: boolean;
  expandDirection: "up" | "down";
  hideExpandTextOnTraceback: boolean;
  showHintsAndTips: boolean;
  /** True while a microchat program is running. */
  chatActive?: boolean;
  /** True when the chat view is shown in place of the REPL. */
  showingChat?: boolean;
  /** Toggle between the chat view and the raw REPL. */
  onToggleChat?: () => void;
}

/**
 * The bar at the top of the serial area exposing serial status and actions.
 */
const SerialBar = ({
  compact,
  onSizeChange,
  background,
  showSyncStatus,
  hideExpandTextOnTraceback,
  showHintsAndTips,
  expandDirection,
  chatActive,
  showingChat,
  onToggleChat,
  ...props
}: SerialBarProps) => {
  const logging = useLogging();
  const handleExpandCollapseClick = useCallback(() => {
    logging.event({
      type: compact ? "serial-expand" : "serial-collapse",
    });
    onSizeChange(compact ? "open" : "compact");
  }, [compact, onSizeChange, logging]);
  const intl = useIntl();
  const helpDisclosure = useDisclosure();
  const traceback = useDeviceTraceback();
  const syncStatus = useSyncStatus();
  const handleShowHintsAndTips = useCallback(() => {
    logging.event({ type: "serial-info" });
    helpDisclosure.onOpen();
  }, [logging, helpDisclosure]);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <SerialHelpDialog
        isOpen={helpDisclosure.isOpen}
        onClose={helpDisclosure.onClose}
        finalFocusRef={showHintsAndTips ? undefined : menuButtonRef}
      />
      <HStack
        justifyContent="space-between"
        p={1}
        backgroundColor={
          traceback && syncStatus === SyncStatus.IN_SYNC
            ? "code.error"
            : syncStatus === SyncStatus.OUT_OF_SYNC
            ? "gray.700"
            : "inherit"
        }
        {...props}
      >
        <SerialIndicators
          compact={compact}
          traceback={traceback}
          overflow="hidden"
          showSyncStatus={showSyncStatus}
        />

        <HStack>
          <CollapsibleButton
            mode={
              hideExpandTextOnTraceback && compact && traceback
                ? "icon"
                : "button"
            }
            variant="unstyled"
            display="flex"
            fontWeight="normal"
            color="white"
            onClick={handleExpandCollapseClick}
            icon={
              <ExpandCollapseIcon
                transform={
                  expandDirection === "down" ? "rotate(180deg)" : undefined
                }
                open={Boolean(compact)}
              />
            }
            iconRight
            text={intl.formatMessage({
              id: compact ? "serial-expand" : "serial-collapse",
            })}
          />
          <HStack spacing="0.5">
            {chatActive && onToggleChat && (
              <IconButton
                variant="sidebar"
                color="white"
                isRound
                aria-label={intl.formatMessage({
                  id: showingChat ? "serial-show-repl" : "serial-show-chat",
                })}
                icon={showingChat ? <RiTerminalBoxLine /> : <RiChat1Line />}
                onClick={onToggleChat}
              />
            )}
            {showHintsAndTips && (
              <IconButton
                variant="sidebar"
                color="white"
                isRound
                aria-label={intl.formatMessage({ id: "serial-hints-and-tips" })}
                icon={<RiInformationLine />}
                onClick={handleShowHintsAndTips}
              />
            )}
            <SerialMenu
              ref={menuButtonRef}
              compact={compact}
              onSizeChange={onSizeChange}
              // Move it to the menu if not shown more visibly.
              onShowHintsAndTips={
                !showHintsAndTips ? handleShowHintsAndTips : undefined
              }
            />
          </HStack>
        </HStack>
      </HStack>
    </>
  );
};

export default SerialBar;
