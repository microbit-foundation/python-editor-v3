/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, BoxProps, Flex } from "@chakra-ui/react";
import { ConnectionStatus } from "@microbit/microbit-connection";
import { RiComputerLine, RiUsbLine } from "react-icons/ri";
import { useIntl } from "react-intl";
import { DeviceContextProvider, useConnectionStatus } from "../device/device-hooks";
import SerialArea from "./SerialArea";
import { SerialTarget, useSerialTargets } from "./serial-targets";

interface SerialPanelProps extends BoxProps {
  /**
   * Which of the stacked serial areas is currently expanded, or null if both
   * are collapsed to their bars. At most one is ever expanded.
   */
  expandedTarget: SerialTarget | null;
  onExpandedTargetChange: (target: SerialTarget | null) => void;
  terminalFontSizePt: number;
  tabOutRef: HTMLElement;
}

/**
 * Two stacked serial areas: the real device on top (closest to the editor)
 * and the simulator underneath.
 *
 * Each is an ordinary {@link SerialArea} bound to its own connection, so all
 * the existing bar/indicator behaviour and icons are preserved. The device
 * area appears whenever a device is connected; the simulator area appears once
 * a program has been run on the simulator (`simSource`).
 *
 * Only one area can be expanded at a time - expanding one collapses the other
 * (its bar stays visible). The expanded area flexes to fill; a collapsed one
 * is just its compact bar.
 */
const SerialPanel = ({
  expandedTarget,
  onExpandedTargetChange,
  terminalFontSizePt,
  tabOutRef,
  ...props
}: SerialPanelProps) => {
  const intl = useIntl();
  const { simulator, simSource } = useSerialTargets();
  const deviceStatus = useConnectionStatus();
  const showDevice =
    deviceStatus === ConnectionStatus.Connected ||
    deviceStatus === ConnectionStatus.Paused;
  const showSimulator = simSource && !!simulator;

  const onSizeChange = (target: SerialTarget) => (size: "compact" | "open") =>
    onExpandedTargetChange(size === "open" ? target : null);

  // A collapsed area is exactly its bar; the expanded one takes the rest.
  const areaBox = (expanded: boolean): BoxProps =>
    expanded
      ? { flex: "1 1 auto", minHeight: 0 }
      : { flex: "0 0 auto", height: `${SerialArea.compactSize}px` };

  return (
    <Flex direction="column" height="100%" overflow="hidden" {...props}>
      {showDevice && (
        <Box overflow="hidden" {...areaBox(expandedTarget === "device")}>
          <SerialArea
            as="section"
            aria-label={intl.formatMessage({ id: "serial-terminal" })}
            sourceIcon={RiUsbLine}
            sourceLabel="serial-source-device"
            compact={expandedTarget !== "device"}
            onSizeChange={onSizeChange("device")}
            showSyncStatus={true}
            expandDirection="up"
            terminalFontSizePt={terminalFontSizePt}
            tabOutRef={tabOutRef}
          />
        </Box>
      )}
      {showSimulator && (
        <Box overflow="hidden" {...areaBox(expandedTarget === "simulator")}>
          <DeviceContextProvider value={simulator}>
            <SerialArea
              as="section"
              aria-label={intl.formatMessage({
                id: "simulator-serial-terminal",
              })}
              sourceIcon={RiComputerLine}
              sourceLabel="serial-source-simulator"
              simulator={true}
              compact={expandedTarget !== "simulator"}
              onSizeChange={onSizeChange("simulator")}
              showSyncStatus={false}
              expandDirection="up"
              terminalFontSizePt={terminalFontSizePt}
              tabOutRef={tabOutRef}
            />
          </DeviceContextProvider>
        </Box>
      )}
    </Flex>
  );
};

export default SerialPanel;
