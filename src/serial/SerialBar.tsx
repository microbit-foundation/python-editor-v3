/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { IconButton } from "@microbit/ui";
import { useCallback, useRef, useState } from "react";
import { RiInformationLine } from "react-icons/ri";
import { useIntl } from "react-intl";
import { HStack } from "styled-system/jsx";
import { SystemStyleObject } from "styled-system/types";
import { token } from "styled-system/tokens";
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

interface SerialBarProps {
  compact?: boolean;
  onSizeChange: (size: "compact" | "open") => void;
  showSyncStatus: boolean;
  expandDirection: "up" | "down";
  hideExpandTextOnTraceback: boolean;
  showHintsAndTips: boolean;
  css?: SystemStyleObject;
}

/**
 * The bar at the top of the serial area exposing serial status and actions.
 */
const SerialBar = ({
  compact,
  onSizeChange,
  showSyncStatus,
  hideExpandTextOnTraceback,
  showHintsAndTips,
  expandDirection,
  css: cssProp,
}: SerialBarProps) => {
  const logging = useLogging();
  const handleExpandCollapseClick = useCallback(() => {
    logging.event({
      type: "serial_toggle",
      detail: { state: compact ? "expand" : "collapse" },
    });
    onSizeChange(compact ? "open" : "compact");
  }, [compact, onSizeChange, logging]);
  const intl = useIntl();
  const [helpOpen, setHelpOpen] = useState(false);
  const traceback = useDeviceTraceback();
  const syncStatus = useSyncStatus();
  const handleShowHintsAndTips = useCallback(() => {
    logging.event({ type: "serial_help" });
    setHelpOpen(true);
  }, [logging]);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <SerialHelpDialog
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        finalFocusRef={showHintsAndTips ? undefined : menuButtonRef}
      />
      <HStack
        justifyContent="space-between"
        p="1"
        // Runtime token lookup: a three-way conditional value isn't reliably
        // statically extractable.
        // whiteAlpha over the inherited terminal background gives the
        // out-of-sync gray (≈#4c4c4c) without pinning a colour.
        style={{
          backgroundColor:
            traceback && syncStatus === SyncStatus.IN_SYNC
              ? token("colors.code.error")
              : syncStatus === SyncStatus.OUT_OF_SYNC
              ? token("colors.whiteAlpha.300")
              : "inherit",
        }}
        css={cssProp}
      >
        <SerialIndicators
          compact={compact}
          traceback={traceback}
          css={{ overflow: "hidden" }}
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
            css={{ display: "flex", fontWeight: "normal", color: "white" }}
            onPress={handleExpandCollapseClick}
            icon={
              <ExpandCollapseIcon
                css={
                  expandDirection === "down"
                    ? { transform: "rotate(180deg)" }
                    : undefined
                }
                open={Boolean(compact)}
              />
            }
            iconRight
            text={intl.formatMessage({
              id: compact ? "serial-expand" : "serial-collapse",
            })}
          />
          <HStack gap="0.5">
            {showHintsAndTips && (
              <IconButton
                variant="sidebar"
                aria-label={intl.formatMessage({ id: "serial-hints-and-tips" })}
                onPress={handleShowHintsAndTips}
              >
                <RiInformationLine />
              </IconButton>
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
