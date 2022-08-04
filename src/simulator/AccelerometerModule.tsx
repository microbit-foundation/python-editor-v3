import { Stack, Text } from "@chakra-ui/react";
import { Sensor } from "./model";
import RangeSensor from "./RangeSensor";

interface AccelerometerModuleProps {
  sensors: Record<string, Sensor>;
  onSensorChange: (id: string, value: any) => void;
}

const AccelerometerModule = ({
  sensors,
  onSensorChange,
}: AccelerometerModuleProps) => (
  <Stack spacing={5}>
    <Axis axis="x" sensors={sensors} onSensorChange={onSensorChange} />
    <Axis axis="y" sensors={sensors} onSensorChange={onSensorChange} />
    <Axis axis="z" sensors={sensors} onSensorChange={onSensorChange} />
  </Stack>
);

interface AxisProps {
  axis: string;
  sensors: Record<string, Sensor>;
  onSensorChange: (id: string, value: any) => void;
}

const Axis = ({ axis, sensors, onSensorChange }: AxisProps) => (
  <RangeSensor
    icon={
      <Text boxSize={6} textAlign="center">
        {axis}
      </Text>
    }
    value={sensors["accelerometer" + axis.toUpperCase()]}
    onSensorChange={onSensorChange}
  />
);

export default AccelerometerModule;
