import {
  Box,
  BoxProps,
  Flex,
  HStack,
  Icon,
  IconButton,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useSimulator } from "../device/device-hooks";
import {
  EVENT_STATE_CHANGE,
  RangeSensor as RangeSensorType,
  SimulatorState,
} from "../device/simulator";
import AccelerometerModule from "./AccelerometerModule";
import RangeSensor from "./RangeSensor";

import { IconType } from "react-icons";
import { RiInformationLine, RiSunFill, RiTempHotFill } from "react-icons/ri";
import { ReactComponent as AccelerometerIcon } from "./icons/accelerometer.svg";
import { ReactComponent as ButtonPressIcon } from "./icons/button-press.svg";
import { ReactComponent as MicrophoneIcon } from "./icons/microphone.svg";
import { ReactComponent as PinsIcon } from "./icons/pins.svg";
import { useIntl } from "react-intl";
import ExpandCollapseIcon from "../common/ExpandCollapseIcon";
import { useRouterState } from "../router-hooks";
import ButtonsModule from "./ButtonModule";
import { RunningStatus } from "./Simulator";
import PinsModule from "./PinsModule";

const modules: string[] = [
  // Controls UI order of the widgets.
  "accelerometer",
  "lightLevel",
  "temperature",
  "soundLevel",
  "buttons",
  "pins",
];

const titles: Record<string, string> = {
  // Sensor id mapped to translatable UI string ids. Sorted.
  accelerometer: "accelerometer",
  buttons: "buttons",
  lightLevel: "light-level",
  pins: "pins",
  soundLevel: "sound-level",
  temperature: "temperature",
};

const references: Record<string, string> = {
  // Sensor id mapped to Reference anchor id. Sorted.
  accelerometer: "accelerometer",
  buttons: "buttons",
  lightLevel: "light-level",
  pins: "pins",
  soundLevel: "microphone",
  temperature: "temperature",
};

export const icons: Record<
  string,
  IconType | React.FunctionComponent<React.SVGProps<SVGSVGElement>>
> = {
  accelerometer: AccelerometerIcon,
  temperature: RiTempHotFill,
  lightLevel: RiSunFill,
  soundLevel: MicrophoneIcon,
  buttons: ButtonPressIcon,
  pins: PinsIcon,
};

const spacing = 5;
const minimisedSpacing = 3;

interface SimulatorModulesProps extends BoxProps {
  running: RunningStatus;
}

const SimulatorModules = ({ running, ...props }: SimulatorModulesProps) => {
  const device = useSimulator();
  const [state, setState] = useState<SimulatorState | undefined>(device.state);
  const intl = useIntl();
  useEffect(() => {
    device.on(EVENT_STATE_CHANGE, setState);
    return () => {
      device.removeListener(EVENT_STATE_CHANGE, setState);
    };
  }, [device]);
  const handleSensorChange = useCallback(
    (id: string, value: number) => {
      device.setSimulatorValue(id, value);
    },
    [device]
  );
  if (!state) {
    // Waiting for info from sim.
    return null;
  }
  return (
    <Flex
      {...props}
      flexDirection="column"
      height="100%"
      width="100%"
      py={spacing}
      px={3}
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
  );
};

interface SensorProps {
  id: string;
  title: string;
  onValueChange: (id: string, value: any) => void;
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
  const disclosure = useDisclosure();
  const intl = useIntl();
  const [, setRouterState] = useRouterState();
  const handleLinkToReference = useCallback(() => {
    setRouterState(
      {
        tab: "reference",
        reference: { id: references[id] },
      },
      "documentation-from-simulator"
    );
  }, [id, setRouterState]);
  return (
    <Stack
      borderBottomWidth={index < modules.length - 1 ? 1 : 0}
      borderColor="grey.200"
      pb={disclosure.isOpen ? spacing : minimisedSpacing}
      mt={index === 0 ? 0 : disclosure.isOpen ? spacing : minimisedSpacing}
      spacing={disclosure.isOpen ? spacing : minimisedSpacing}
    >
      <HStack justifyContent="space-between">
        {disclosure.isOpen && (
          <HStack>
            <Text as="h3" fontWeight="semibold">
              {title}
            </Text>
            <IconButton
              aria-label={intl.formatMessage({
                id: "simulator-reference-link",
              })}
              icon={<RiInformationLine />}
              color="brand.500"
              variant="ghost"
              size="xs"
              fontSize="lg"
              onClick={handleLinkToReference}
            />
          </HStack>
        )}
        {!disclosure.isOpen && (
          <Box w="100%">
            <ModuleForId
              id={id}
              title={title}
              state={state}
              onValueChange={onValueChange}
              running={running}
              minimised={true}
            />
          </Box>
        )}
        <IconButton
          icon={<ExpandCollapseIcon open={disclosure.isOpen} />}
          aria-label={
            disclosure.isOpen
              ? intl.formatMessage(
                  { id: "simulator-collapse-module" },
                  { title }
                )
              : intl.formatMessage({ id: "simulator-expand-module" }, { title })
          }
          size="sm"
          color="brand.200"
          variant="ghost"
          fontSize="2xl"
          onClick={disclosure.onToggle}
        />
      </HStack>
      {disclosure.isOpen && (
        <ModuleForId
          id={id}
          title={title}
          state={state}
          onValueChange={onValueChange}
          running={running}
          minimised={false}
        />
      )}
    </Stack>
  );
};

interface ModuleForIdProps extends SensorProps {
  minimised: boolean;
}

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
          icon={<Icon as={icons[id]} color="blimpTeal.400" boxSize="6" />}
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
          icon={<Icon as={icons[id]} color="blimpTeal.400" boxSize="6" />}
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
          icon={<Icon as={icons[id]} color="blimpTeal.400" boxSize="6" />}
          state={state}
          onValueChange={onValueChange}
          running={running}
          minimised={minimised}
        />
      );
    case "accelerometer":
      return (
        <AccelerometerModule
          key={id}
          icon={<Icon as={icons[id]} color="blimpTeal.400" boxSize="6" />}
          state={state}
          onValueChange={onValueChange}
          minimised={minimised}
        />
      );
    default:
      return null;
  }
};

export default SimulatorModules;
