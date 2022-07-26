import { BoxProps, Stack } from "@chakra-ui/react";
import { Sensor } from "./model";
import RangeSensor from "./RangeSensor";

interface SensorsProps extends BoxProps {
  value: Sensor[];
  onSensorChange: (id: string, value: number) => void;
}

const Sensors = ({ value, onSensorChange, ...props }: SensorsProps) => {
  return (
    <Stack {...props} height="100%" width="100%" p={5} spacing={3}>
      {value.map((sensor) => {
        switch (sensor.type) {
          case "range":
            return (
              <RangeSensor
                key={sensor.id}
                value={sensor}
                onSensorChange={onSensorChange}
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
