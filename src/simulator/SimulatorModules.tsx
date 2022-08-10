import {
  Box,
  BoxProps,
  Collapse,
  HStack,
  Icon,
  IconButton,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { IconType } from "react-icons";
import { RiSunFill, RiTempHotFill, RiWebcamLine } from "react-icons/ri";
import ExpandCollapseIcon from "../common/ExpandCollapseIcon";
import { useSimulator } from "../device/device-hooks";
import { EVENT_SENSORS } from "../device/simulator";
import AccelerometerModule from "./AccelerometerModule";
import { RangeSensor as RangeSensorType, Sensor } from "./model";
import RangeSensor from "./RangeSensor";

const modules: string[] = [
  // Controls UI order of the widgets.
  "accelerometer",
  "lightLevel",
  "microphone",
  "temperature",
];

const titles: Record<string, string> = {
  // To move to translation. Sorted.
  accelerometer: "Accelerometer",
  lightLevel: "Light level",
  microphone: "Microphone",
  temperature: "Temperature",
};

export const icons: Record<string, IconType> = {
  temperature: RiTempHotFill,
  lightLevel: RiSunFill,
  soundLevel: RiWebcamLine, // Improbably like a microphone.
};

const spacing = 5;

interface SimulatorModulesProps extends BoxProps {}

const SimulatorModules = (props: SimulatorModulesProps) => {
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
        />
      ))}
    </Stack>
  );
};

interface CollapsibleModuleProps extends ModuleForIdProps {
  index: number;
}

const CollapsibleModule = ({
  index,
  id,
  sensors,
  onSensorChange,
}: CollapsibleModuleProps) => {
  const disclosure = useDisclosure();
  const title = titles[id];
  return (
    <Stack
      borderBottomWidth={index < modules.length - 1 ? 1 : 0}
      borderColor="grey.200"
      pb={spacing}
      spacing={0}
    >
      <HStack
        justifyContent="space-between"
        onClick={disclosure.onToggle}
        cursor="pointer"
      >
        <Text as="h3">{title}</Text>
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
        />
      </HStack>
      <Collapse in={disclosure.isOpen}>
        <Box mt={spacing}>
          <ModuleForId
            id={id}
            sensors={sensors}
            onSensorChange={onSensorChange}
          />
        </Box>
      </Collapse>
    </Stack>
  );
};

interface ModuleForIdProps {
  id: string;
  onSensorChange: (id: string, value: any) => void;
  sensors: Record<string, Sensor>;
}

const ModuleForId = ({ id, sensors, onSensorChange }: ModuleForIdProps) => {
  switch (id) {
    case "lightLevel":
    case "temperature":
      return (
        <RangeSensor
          icon={<Icon as={icons[id]} color="blimpTeal.400" boxSize="6" />}
          key={id}
          value={sensors[id] as RangeSensorType}
          onSensorChange={onSensorChange}
        />
      );
    case "microphone":
      return (
        <RangeSensor
          icon={
            <Icon as={icons.soundLevel} color="blimpTeal.400" boxSize="6" />
          }
          key={id}
          value={sensors.soundLevel as RangeSensorType}
          onSensorChange={onSensorChange}
        />
      );
    case "accelerometer":
      return (
        <AccelerometerModule
          key={id}
          sensors={sensors}
          onSensorChange={onSensorChange}
        />
      );
    default:
      return null;
  }
};

export default SimulatorModules;
