import { BoxProps, Icon, Stack, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useSimulator } from "../device/device-hooks";
import { EVENT_SENSORS } from "../device/simulator";
import AccelerometerModule from "./AccelerometerModule";
import { RangeSensor as RangeSensorType, Sensor } from "./model";
import RangeSensor from "./RangeSensor";

import { IconType } from "react-icons";
import {
  RiSunFill,
  RiTempHotFill,
  RiVolumeUpLine,
  RiWebcamLine,
} from "react-icons/ri";

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
  const spacing = 5;
  return (
    <Stack {...props} height="100%" width="100%" p={5} spacing={spacing}>
      {modules.map((id, index) => (
        <Stack
          borderBottomWidth={index < modules.length - 1 ? 1 : 0}
          borderColor="grey.200"
          spacing={5}
          pb={spacing}
        >
          <Text as="h3">{titles[id]}</Text>
          <ModuleForId
            id={id}
            sensors={sensors}
            onSensorChange={handleSensorChange}
          />
        </Stack>
      ))}
    </Stack>
  );
};

const ModuleForId = ({
  id,
  sensors,
  onSensorChange,
}: {
  id: string;
  onSensorChange: (id: string, value: any) => void;
  sensors: Record<string, Sensor>;
}) => {
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
