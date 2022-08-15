import {
  Box,
  BoxProps,
  HStack,
  Icon,
  IconButton,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useSimulator } from "../device/device-hooks";
import { EVENT_SENSORS } from "../device/simulator";
import AccelerometerModule from "./AccelerometerModule";
import {
  RangeSensor as RangeSensorType,
  RangeSensorWithThresholds as RangeSensorWithThresholdsType,
  Sensor,
} from "./model";
import RangeSensor from "./RangeSensor";

import { IconType } from "react-icons";
import { RiSunFill, RiTempHotFill, RiWebcamLine } from "react-icons/ri";
import ExpandCollapseIcon from "../common/ExpandCollapseIcon";
import ButtonsModule from "./ButtonModule";
import { SimState } from "./Simulator";

const modules: string[] = [
  // Controls UI order of the widgets.
  "accelerometer",
  "lightLevel",
  "temperature",
  "soundLevel",
  "buttons",
];

const titles: Record<string, string> = {
  // To move to translation. Sorted.
  accelerometer: "Accelerometer",
  buttons: "Buttons",
  lightLevel: "Light level",
  soundLevel: "Sound level",
  temperature: "Temperature",
};

export const icons: Record<string, IconType> = {
  temperature: RiTempHotFill,
  lightLevel: RiSunFill,
  soundLevel: RiWebcamLine, // Improbably like a microphone.
};

const spacing = 5;
const minimisedSpacing = 3;

interface SimulatorModulesProps extends BoxProps {
  simState: SimState;
}

const SimulatorModules = ({ simState, ...props }: SimulatorModulesProps) => {
  const device = useSimulator();
  const [sensors, setSensors] = useState<Record<string, Sensor>>(
    device.sensors
  );
  useEffect(() => {
    device.on(EVENT_SENSORS, setSensors);
    return () => {
      device.removeListener(EVENT_SENSORS, setSensors);
    };
  }, [device]);
  const handleSensorChange = useCallback(
    (id: string, value: number) => {
      setSensors({
        ...sensors,
        [id]: { ...(sensors[id] as any), value },
      });
      device.sensorWrite(id, value);
    },
    [device, sensors]
  );
  if (Object.values(sensors).length === 0) {
    // Waiting for info from sim.
    return null;
  }
  return (
    <Stack {...props} height="100%" width="100%" p={spacing} spacing={spacing}>
      {modules.map((id, index) => (
        <CollapsibleModule
          key={id}
          index={index}
          id={id}
          sensors={sensors}
          onSensorChange={handleSensorChange}
          simState={simState}
        />
      ))}
    </Stack>
  );
};

interface SensorProps {
  id: string;
  onSensorChange: (id: string, value: any) => void;
  sensors: Record<string, Sensor>;
  simState: SimState;
}

interface CollapsibleModuleProps extends SensorProps {
  index: number;
}

const CollapsibleModule = ({
  index,
  id,
  sensors,
  onSensorChange,
  simState,
}: CollapsibleModuleProps) => {
  const disclosure = useDisclosure();
  const title = titles[id];
  return (
    <Stack
      borderBottomWidth={index < modules.length - 1 ? 1 : 0}
      borderColor="grey.200"
      pb={disclosure.isOpen ? spacing : minimisedSpacing}
      spacing={disclosure.isOpen ? spacing : minimisedSpacing}
    >
      <HStack justifyContent="space-between" spacing={3}>
        {disclosure.isOpen && <Text as="h3">{title}</Text>}
        {!disclosure.isOpen && (
          <Box w="100%">
            <ModuleForId
              id={id}
              sensors={sensors}
              onSensorChange={onSensorChange}
              simState={simState}
              minimised={true}
            />
          </Box>
        )}
        <IconButton
          icon={<ExpandCollapseIcon open={disclosure.isOpen} />}
          aria-label={
            disclosure.isOpen
              ? `Collapse ${title.toLowerCase()} module`
              : `Expand ${title.toLowerCase()} module`
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
          sensors={sensors}
          onSensorChange={onSensorChange}
          simState={simState}
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
  sensors,
  onSensorChange,
  simState,
  minimised,
}: ModuleForIdProps) => {
  switch (id) {
    case "lightLevel":
    case "temperature":
      return (
        <RangeSensor
          icon={<Icon as={icons[id]} color="blimpTeal.400" boxSize="6" />}
          key={id}
          sensor={sensors[id] as RangeSensorType}
          onSensorChange={onSensorChange}
          minimised={minimised}
        />
      );
    case "soundLevel":
      return (
        <RangeSensor
          icon={
            <Icon as={icons.soundLevel} color="blimpTeal.400" boxSize="6" />
          }
          key={id}
          sensor={sensors.soundLevel as RangeSensorWithThresholdsType}
          onSensorChange={onSensorChange}
          minimised={minimised}
        />
      );
    case "buttons":
      return (
        <ButtonsModule
          key={id}
          sensors={sensors}
          onSensorChange={onSensorChange}
          simState={simState}
          minimised={minimised}
        />
      );
    case "accelerometer":
      return (
        <AccelerometerModule
          key={id}
          sensors={sensors}
          onSensorChange={onSensorChange}
          minimised={minimised}
        />
      );
    default:
      return null;
  }
};

export default SimulatorModules;
