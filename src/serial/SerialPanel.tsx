/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Box,
  BoxProps,
  Divider,
  HStack,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Portal,
  Tab,
  TabList,
  Tabs,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { ConnectionStatus } from "@microbit/microbit-connection";
import {
  ComponentType,
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Terminal } from "xterm";
import { GoCheck } from "react-icons/go";
import { MdMoreVert } from "react-icons/md";
import {
  RiComputerLine,
  RiErrorWarningLine,
  RiFlashlightFill,
  RiInformationLine,
  RiKeyboardBoxLine,
  RiUsbLine,
} from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import CollapsibleButton from "../common/CollapsibleButton";
import ExpandCollapseIcon from "../common/ExpandCollapseIcon";
import { zIndexAboveTerminal } from "../common/zIndex";
import { backgroundColorTerm } from "../deployment/misc";
import {
  DeviceContextProvider,
  SyncStatus,
  Traceback,
  useConnectionStatus,
  useDevice,
  useDeviceTraceback,
  useSyncStatus,
} from "../device/device-hooks";
import { useLogging } from "../logging/logging-hooks";
import MaybeTracebackLink from "./MaybeTracebackLink";
import SerialArea from "./SerialArea";
import { SerialHelpDialog } from "./SerialHelp";
import { TerminalContext, useCurrentTerminalRef } from "./serial-hooks";
import { SerialTarget, useSerialTargets } from "./serial-targets";
import XTerm from "./XTerm";

interface SourceState {
  traceback: Traceback | undefined;
  sync: SyncStatus;
}

/**
 * Reports its DeviceContext's traceback and sync status up to the panel.
 * Rendered inside each source's context, since both are tracked per
 * connection.
 */
const SourceStateReporter = ({
  source,
  onChange,
}: {
  source: SerialTarget;
  onChange: (source: SerialTarget, state: SourceState) => void;
}) => {
  const traceback = useDeviceTraceback();
  const sync = useSyncStatus();
  useEffect(() => {
    onChange(source, { traceback, sync });
  }, [source, traceback, sync, onChange]);
  return null;
};

type TerminalRegistry = Partial<
  Record<SerialTarget, MutableRefObject<Terminal | undefined>>
>;

/** Publishes its terminal to the panel so it can be focused after a command. */
const TerminalRegistrar = ({
  source,
  registry,
}: {
  source: SerialTarget;
  registry: MutableRefObject<TerminalRegistry>;
}) => {
  const terminalRef = useCurrentTerminalRef();
  useEffect(() => {
    const map = registry.current;
    map[source] = terminalRef;
    return () => {
      delete map[source];
    };
  }, [source, terminalRef, registry]);
  return null;
};

interface SerialPanelProps extends Omit<BoxProps, "onChange"> {
  compact?: boolean;
  expandDirection: "up" | "down";
  onSizeChange: (size: "compact" | "open") => void;
  terminalFontSizePt: number;
  showHintsAndTips?: boolean;
  tabOutRef: HTMLElement;
}

const sourceMeta: Record<
  SerialTarget,
  { labelId: string; icon: ComponentType; accent: string }
> = {
  simulator: {
    labelId: "serial-source-simulator",
    icon: RiComputerLine,
    accent: "blimpTeal.400",
  },
  device: {
    labelId: "serial-source-device",
    icon: RiUsbLine,
    accent: "blue.300",
  },
};

/**
 * A single serial panel that shows either the real device or the simulator.
 *
 * A proper (Chakra) tab widget selects the source - full keyboard support and
 * ARIA roles/associations - sharing the header row with the serial actions
 * (expand/collapse, info, interrupt/reset). Each source's terminal is bound
 * to its own connection and, once shown, kept mounted so its scrollback
 * survives switching. Panels mount lazily so xterm always opens while visible.
 */
const SerialPanel = ({
  compact,
  expandDirection,
  onSizeChange,
  terminalFontSizePt,
  showHintsAndTips = true,
  tabOutRef,
  ...props
}: SerialPanelProps) => {
  const intl = useIntl();
  const logging = useLogging();
  const helpDisclosure = useDisclosure();
  const terminals = useRef<TerminalRegistry>({});
  const device = useDevice();
  const { simulator, simSource, activeTarget, setActiveTarget } =
    useSerialTargets();
  const deviceStatus = useConnectionStatus();
  const deviceConnected =
    deviceStatus === ConnectionStatus.Connected ||
    deviceStatus === ConnectionStatus.Paused;
  // Traceback and sync are detected per connection, so each source reports
  // its own state.
  const [states, setStates] = useState<
    Partial<Record<SerialTarget, SourceState>>
  >({});
  const reportState = useCallback(
    (source: SerialTarget, state: SourceState) => {
      setStates((prev) => {
        const current = prev[source];
        return current &&
          current.traceback === state.traceback &&
          current.sync === state.sync
          ? prev
          : { ...prev, [source]: state };
      });
    },
    []
  );

  const sources: SerialTarget[] = [];
  if (deviceConnected) {
    sources.push("device");
  }
  if (simSource && simulator) {
    sources.push("simulator");
  }
  if (sources.length === 0) {
    return null;
  }

  const activeIndex = Math.max(0, sources.indexOf(activeTarget));
  const active = sources[activeIndex];
  const activeConnection = active === "simulator" && simulator ? simulator : device;

  const sendCommand = (data: string) => {
    onSizeChange("open");
    activeConnection.serialWrite(data);
    terminals.current[active]?.current?.focus();
  };
  const interrupt = () => {
    logging.event({ type: "serial-interrupt" });
    sendCommand("\x03");
  };
  const reset = () => {
    logging.event({ type: "serial-reset" });
    sendCommand("\x04");
  };

  const activeTraceback = states[active]?.traceback;
  const deviceSync = states.device?.sync;
  const showDeviceSync =
    active === "device" &&
    (!activeTraceback || deviceSync === SyncStatus.OUT_OF_SYNC);
  // The traceback only belongs in the header when collapsed; when expanded
  // it's already visible in the terminal itself.
  const showTraceback = Boolean(compact && activeTraceback);
  // The status colour for a source: red for an (up-to-date) runtime error, a
  // darker shade when there's code to flash/run, otherwise the terminal
  // background. Applied per source so a healthy tab stays neutral even if the
  // other source has an error.
  const sourceBackground = (source: SerialTarget) => {
    const state = states[source];
    if (state?.traceback && state.sync === SyncStatus.IN_SYNC) {
      return "code.error";
    }
    if (state?.sync === SyncStatus.OUT_OF_SYNC) {
      return "gray.700";
    }
    return backgroundColorTerm;
  };
  const barBackground = sourceBackground(active);

  return (
    <>
      <SerialHelpDialog
        isOpen={helpDisclosure.isOpen}
        onClose={helpDisclosure.onClose}
      />
      <Tabs
        index={activeIndex}
        onChange={(i) => setActiveTarget(sources[i])}
        variant="unstyled"
        display="block"
        height="100%"
        {...props}
      >
        <HStack
          justifyContent="space-between"
          spacing={0}
          height={`${SerialArea.compactSize}px`}
          overflow="hidden"
          pl={1}
          pr={1}
          backgroundColor={barBackground}
        >
          <TabList borderBottom="none">
            {sources.map((source) => {
              const { labelId, icon, accent } = sourceMeta[source];
              return (
                <Tab
                  key={source}
                  color="whiteAlpha.700"
                  fontWeight="medium"
                  fontSize="sm"
                  px={3}
                  py={2}
                  borderBottomWidth={2}
                  borderColor="transparent"
                  backgroundColor={sourceBackground(source)}
                  _hover={{ color: "white" }}
                  _selected={{
                    color: "white",
                    backgroundColor: "whiteAlpha.200",
                    borderColor: accent,
                  }}
                >
                  <HStack spacing={2}>
                    <Icon as={icon} color={accent} boxSize={4} />
                    <Text>{intl.formatMessage({ id: labelId })}</Text>
                  </HStack>
                </Tab>
              );
            })}
          </TabList>
          <HStack spacing="0.5" pr={1} color="white">
            {showDeviceSync ? (
              <Text
                display="inline-flex"
                alignItems="center"
                whiteSpace="nowrap"
                pr={1}
              >
                <FormattedMessage
                  id={
                    deviceSync === SyncStatus.OUT_OF_SYNC
                      ? "serial-ready-to-flash"
                      : "serial-flashed"
                  }
                />
                <Icon
                  ml={1}
                  as={
                    deviceSync === SyncStatus.OUT_OF_SYNC
                      ? RiFlashlightFill
                      : GoCheck
                  }
                  fill="white"
                  boxSize={5}
                />
              </Text>
            ) : showTraceback ? (
              <HStack spacing={1} pr={1} maxW="20rem" overflow="hidden">
                <Icon
                  as={RiErrorWarningLine}
                  fill="white"
                  boxSize={5}
                  flexShrink={0}
                />
                <Box
                  fontSize="sm"
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  // Keep the line-number span the same size as the message.
                  sx={{ span: { fontSize: "inherit" } }}
                >
                  <MaybeTracebackLink traceback={activeTraceback} />
                </Box>
              </HStack>
            ) : null}
            {(showDeviceSync || showTraceback) && (
              <Divider
                orientation="vertical"
                height={6}
                mx={2}
                borderColor="whiteAlpha.400"
              />
            )}
            <CollapsibleButton
              mode={showTraceback ? "icon" : "button"}
              variant="unstyled"
              display="flex"
              fontWeight="normal"
              color="white"
              onClick={() => onSizeChange(compact ? "open" : "compact")}
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
            {showHintsAndTips && (
              <IconButton
                variant="sidebar"
                color="white"
                isRound
                aria-label={intl.formatMessage({ id: "serial-hints-and-tips" })}
                icon={<RiInformationLine />}
                onClick={() => {
                  logging.event({ type: "serial-info" });
                  helpDisclosure.onOpen();
                }}
              />
            )}
            <Menu placement={compact ? "top-end" : undefined}>
              <MenuButton
                as={IconButton}
                aria-label={intl.formatMessage({ id: "serial-menu" })}
                variant="sidebar"
                color="white"
                isRound
                icon={<MdMoreVert />}
              />
              <Portal>
                <MenuList zIndex={zIndexAboveTerminal}>
                  <MenuItem icon={<RiKeyboardBoxLine />} onClick={interrupt}>
                    <FormattedMessage id="serial-ctrl-c-action" />
                  </MenuItem>
                  <MenuItem icon={<RiKeyboardBoxLine />} onClick={reset}>
                    <FormattedMessage id="serial-ctrl-d-action" />
                  </MenuItem>
                  {!showHintsAndTips && (
                    <>
                      <MenuDivider />
                      <MenuItem
                        icon={<RiInformationLine />}
                        onClick={helpDisclosure.onOpen}
                      >
                        <FormattedMessage id="serial-hints-and-tips" />
                      </MenuItem>
                    </>
                  )}
                </MenuList>
              </Portal>
            </Menu>
          </HStack>
        </HStack>
        {/* Terminals are stacked and toggled with visibility (never
            display:none, which breaks xterm's sizing/input). Both stay
            mounted so each keeps its scrollback; the inactive one is removed
            from the a11y tree and tab order by visibility:hidden. Sized by
            calc (not flex) so it collapses to exactly 0 when compact, and
            hidden entirely from view and a11y in that state. */}
        <Box
          position="relative"
          height={`calc(100% - ${SerialArea.compactSize}px)`}
          overflow="hidden"
          backgroundColor={backgroundColorTerm}
          visibility={compact ? "hidden" : undefined}
        >
          {sources.map((source) => {
            const isActive = source === active;
            const terminal = (
              <XTerm
                height="100%"
                ml={1}
                mr={1}
                fontSizePt={terminalFontSizePt}
                tabOutRef={tabOutRef}
                // Re-fit when it actually becomes visible (selected and not
                // collapsed), so the row count matches the viewport and there's
                // no phantom scrollbar.
                active={isActive && !compact}
              />
            );
            return (
              <Box
                key={source}
                role="tabpanel"
                aria-label={intl.formatMessage({
                  id: sourceMeta[source].labelId,
                })}
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                visibility={isActive ? undefined : "hidden"}
              >
                {source === "simulator" && simulator ? (
                  <DeviceContextProvider value={simulator}>
                    <SourceStateReporter
                      source="simulator"
                      onChange={reportState}
                    />
                    <TerminalContext>
                      <TerminalRegistrar source="simulator" registry={terminals} />
                      {terminal}
                    </TerminalContext>
                  </DeviceContextProvider>
                ) : (
                  <>
                    <SourceStateReporter source="device" onChange={reportState} />
                    <TerminalContext>
                      <TerminalRegistrar source="device" registry={terminals} />
                      {terminal}
                    </TerminalContext>
                  </>
                )}
              </Box>
            );
          })}
        </Box>
      </Tabs>
    </>
  );
};

export default SerialPanel;
