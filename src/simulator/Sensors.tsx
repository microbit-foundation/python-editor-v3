import { BoxProps, Stack } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useSimulatorDevice } from "../device/device-hooks";
import { EVENT_SENSORS } from "../device/simulator";
import { Sensor } from "./model";
import RangeSensor from "./RangeSensor";

interface SensorsProps extends BoxProps {}

const Sensors = (props: SensorsProps) => {
  const device = useSimulatorDevice();
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
        [id]: { ...sensors[id], value },
      });
      device.sensorWrite(id, value);
    },
    [device, sensors]
  );

  return (
    <Stack {...props} height="100%" width="100%" p={5} spacing={3}>
      {Object.values(sensors).map((sensor) => {
        switch (sensor.type) {
          case "range":
            return (
              <RangeSensor
                key={sensor.id}
                value={sensor}
                onSensorChange={handleSensorChange}
              />
            );
          default:
            return null;
        }
      })}
    </Stack>
  );
};

export default Sensors;
