import { Icon, IconButton, Text } from "@microbit/ui";
import { useCallback, useEffect, useState } from "react";
import { Box, Flex, HStack, Stack } from "styled-system/jsx";
import { SystemStyleObject } from "styled-system/types";
import { useSimulator } from "../device/device-hooks";
import AccelerometerModule from "./AccelerometerModule";
import RangeSensor from "./RangeSensor";

import { IconType } from "react-icons";
import { RiInformationLine, RiSunFill, RiTempHotFill } from "react-icons/ri";
import { useIntl } from "react-intl";
import ExpandCollapseIcon from "../common/ExpandCollapseIcon";
import useRafState from "../common/use-raf-state";
import {
  RangeSensor as RangeSensorType,
  SensorStateKey,
  SimulatorState,
  StateChange,
} from "../device/simulator";
import { useRouterState } from "../router-hooks";
import ButtonsModule from "./ButtonsModule";
import CompassModule from "./CompassModule";
import { DataLogProvider } from "./data-logging-hooks";
import DataLoggingModule from "./DataLoggingModule";
import AccelerometerIcon from "./icons/accelerometer.svg?react";
import ButtonPressIcon from "./icons/button-press.svg?react";
import CompassIcon from "./icons/compass.svg?react";
import DataLoggingIcon from "./icons/data-logging.svg?react";
import MicrophoneIcon from "./icons/microphone.svg?react";
import PinsIcon from "./icons/pins.svg?react";
import RadioIcon from "./icons/radio.svg?react";
import PinsModule from "./PinsModule";
import { RadioChatProvider } from "./radio-hooks";
import RadioModule from "./RadioModule";
import { RunningStatus } from "./Simulator";

const modules: string[] = [
  // Controls UI order of the widgets.
  "accelerometer",
  "lightLevel",
  "temperature",
  "compass",
  "soundLevel",
  "buttons",
  "pins",
  "radio",
  "log",
];

const titles: Record<string, string> = {
  // Sensor id mapped to translatable UI string ids. Sorted.
  accelerometer: "accelerometer",
  buttons: "buttons",
  compass: "compass",
  lightLevel: "light-level",
  pins: "pins",
  soundLevel: "sound-level",
  temperature: "temperature",
  radio: "radio",
  log: "log",
};

const references: Record<string, string> = {
  // Sensor id mapped to Reference anchor id. Sorted.
  accelerometer: "accelerometer",
  buttons: "buttons",
  compass: "compass",
  lightLevel: "light-level",
  pins: "pins",
  soundLevel: "microphone",
  temperature: "temperature",
  radio: "radio",
  log: "data-logging",
};

export const icons: Record<
  string,
  IconType | React.FunctionComponent<React.SVGProps<SVGSVGElement>>
> = {
  accelerometer: AccelerometerIcon,
  buttons: ButtonPressIcon,
  compass: CompassIcon,
  lightLevel: RiSunFill,
  pins: PinsIcon,
  soundLevel: MicrophoneIcon,
  temperature: RiTempHotFill,
  radio: RadioIcon,
  log: DataLoggingIcon,
};

interface SimulatorModulesProps {
  running: RunningStatus;
  css?: SystemStyleObject;
}

const SimulatorModules = ({ running, css: cssProp }: SimulatorModulesProps) => {
  const device = useSimulator();
  const [state, setState] = useRafState<SimulatorState | undefined>(
    device.state
  );
  const intl = useIntl();
  useEffect(() => {
    const listener = (event: StateChange) => {
      setState(event.state);
    };
    device.addEventListener("statechange", listener);
    return () => {
      device.removeEventListener("statechange", listener);
    };
  }, [device, setState]);
  const handleSensorChange = useCallback(
    (id: SensorStateKey, value: number) => {
      device.setSimulatorValue(id, value);
    },
    [device]
  );
  if (!state) {
    // Waiting for info from sim.
    return null;
  }
  return (
    <RadioChatProvider group={state.radio.group}>
      <DataLogProvider>
        <Flex
          css={cssProp}
          flexDirection="column"
          height="100%"
          width="100%"
          py="5"
          px="3"
        >
          {modules.map((id, index) => (
            <CollapsibleModule
              key={id}
              index={index}
              id={id}
              title={intl.formatMessage({ id: `simulator-${titles[id]}` })}
              state={state}
              onValueChange={handleSensorChange}
              running={running}
            />
          ))}
        </Flex>
      </DataLogProvider>
    </RadioChatProvider>
  );
};

interface SensorProps {
  id: string;
  title: string;
  onValueChange: (id: SensorStateKey, value: any) => void;
  state: SimulatorState;
  running: RunningStatus;
}

interface CollapsibleModuleProps extends SensorProps {
  index: number;
}

const CollapsibleModule = ({
  index,
  id,
  title,
  state,
  onValueChange,
  running,
}: CollapsibleModuleProps) => {
  const [isOpen, setOpen] = useState(false);
  const intl = useIntl();
  const [, setRouterState] = useRouterState();
  const handleLinkToReference = useCallback(() => {
    setRouterState(
      {
        tab: "reference",
        slug: { id: references[id] },
        focus: true,
      },
      "documentation-from-simulator"
    );
  }, [id, setRouterState]);
  const module = (
    <ModuleForId
      id={id}
      title={title}
      state={state}
      onValueChange={onValueChange}
      running={running}
      minimised={!isOpen}
    />
  );
  return (
    <Stack
      // The Chakra original's grey.200 was an invalid token that fell back
      // to the global gray.200 border colour; make it explicit.
      borderBottomWidth={index < modules.length - 1 ? "1px" : "0"}
      borderBottomStyle="solid"
      borderColor="gray.200"
      pb={isOpen ? "5" : "3"}
      mt={index === 0 ? "0" : "3"}
      gap={isOpen ? "5" : "3"}
    >
      <HStack justifyContent="space-between">
        {isOpen && (
          <HStack>
            <Text as="h3" fontWeight="semibold">
              {title}
            </Text>
            <IconButton
              aria-label={intl.formatMessage({
                id: "simulator-reference-link",
              })}
              css={{ color: "brand.500", fontSize: "lg" }}
              variant="ghost"
              size="xs"
              onPress={handleLinkToReference}
            >
              <RiInformationLine />
            </IconButton>
          </HStack>
        )}
        {!isOpen && <Box w="100%">{module}</Box>}
        <IconButton
          css={{ alignSelf: "flex-start", color: "brand.200", fontSize: "2xl" }}
          aria-label={
            isOpen
              ? intl.formatMessage(
                  { id: "simulator-collapse-module" },
                  { title }
                )
              : intl.formatMessage({ id: "simulator-expand-module" }, { title })
          }
          size="sm"
          variant="ghost"
          onPress={() => setOpen(!isOpen)}
        >
          <ExpandCollapseIcon open={isOpen} />
        </IconButton>
      </HStack>
      {isOpen && module}
    </Stack>
  );
};

interface ModuleForIdProps extends SensorProps {
  minimised: boolean;
}

const ModuleIcon = ({ id }: { id: string }) => (
  <Icon
    as={icons[id] as IconType}
    css={{ color: "blimpTeal.400", width: "6", height: "6" }}
  />
);

const ModuleForId = ({
  id,
  title,
  state,
  onValueChange,
  running,
  minimised,
}: ModuleForIdProps) => {
  switch (id) {
    case "lightLevel":
    case "temperature":
    case "soundLevel":
      return (
        <RangeSensor
          id={id}
          icon={<ModuleIcon id={id} />}
          key={id}
          title={title}
          sensor={state[id] as RangeSensorType}
          onSensorChange={onValueChange}
          minimised={minimised}
        />
      );
    case "buttons":
      return (
        <ButtonsModule
          key={id}
          icon={<ModuleIcon id={id} />}
          state={state}
          onValueChange={onValueChange}
          running={running}
          minimised={minimised}
        />
      );
    case "pins":
      return (
        <PinsModule
          key={id}
          icon={<ModuleIcon id={id} />}
          state={state}
          onValueChange={onValueChange}
          running={running}
          minimised={minimised}
        />
      );
    case "log":
      return (
        <DataLoggingModule
          key={id}
          icon={<ModuleIcon id={id} />}
          logFull={state.dataLogging.logFull}
          minimised={minimised}
        />
      );
    case "accelerometer":
      return (
        <AccelerometerModule
          key={id}
          icon={<ModuleIcon id={id} />}
          state={state}
          onValueChange={onValueChange}
          running={running}
          minimised={minimised}
        />
      );
    case "compass":
      return (
        <CompassModule
          key={id}
          icon={<ModuleIcon id={id} />}
          state={state}
          onValueChange={onValueChange}
          minimised={minimised}
        />
      );
    case "radio":
      return (
        <RadioModule
          key={id}
          icon={<ModuleIcon id={id} />}
          enabled={state.radio.enabled}
          group={state.radio.group}
          minimised={minimised}
        />
      );
    default:
      return null;
  }
};

export default SimulatorModules;
