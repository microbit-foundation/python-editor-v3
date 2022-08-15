import { HStack, IconButton, Select, Stack, Text } from "@chakra-ui/react";
import { ChangeEvent, useCallback, useState } from "react";
import { RiSendPlane2Line } from "react-icons/ri";
import { RangeSensor as RangeSensorType, Sensor } from "./model";
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
    <Gesture sensors={sensors} onSensorChange={onSensorChange} />
    <Axis axis="x" sensors={sensors} onSensorChange={onSensorChange} />
    <Axis axis="y" sensors={sensors} onSensorChange={onSensorChange} />
    <Axis axis="z" sensors={sensors} onSensorChange={onSensorChange} />
  </Stack>
);

interface GestureProps {
  sensors: Record<string, Sensor>;
  onSensorChange: (id: string, value: any) => void;
}

const Gesture = ({ sensors, onSensorChange }: GestureProps) => {
  const sensor = sensors["gesture"];
  if (sensor.type !== "enum") {
    throw new Error("Unexpected sensor type");
  }
  const choices = sensor.choices;
  const [choice, setChoice] = useState("shake");
  const [active, setActive] = useState(false);

  const handleSelectChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setChoice(e.currentTarget.value);
    },
    [setChoice]
  );
  const handleClick = useCallback(() => {
    setActive(true);
    onSensorChange(sensor.id, choice);
    setTimeout(() => {
      setActive(false);
      onSensorChange(sensor.id, "none");
    }, 500);
  }, [setActive, onSensorChange, choice, sensor.id]);

  return (
    <HStack spacing={3}>
      <Select
        colorScheme="blackAlpha"
        value={choice}
        onChange={handleSelectChange}
      >
        {choices.map((choice) => (
          <option key={choice} value={choice}>
            {choice}
          </option>
        ))}
      </Select>
      <IconButton
        icon={<RiSendPlane2Line />}
        colorScheme="blackAlpha"
        disabled={active}
        onClick={handleClick}
        aria-label="Send gesture"
      ></IconButton>
    </HStack>
  );
};

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
    sensor={sensors["accelerometer" + axis.toUpperCase()] as RangeSensorType}
    onSensorChange={onSensorChange}
  />
);

export default AccelerometerModule;
