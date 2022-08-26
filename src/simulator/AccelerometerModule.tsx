import { HStack, IconButton, Select, Stack, Text } from "@chakra-ui/react";
import { ChangeEvent, ReactNode, useCallback, useState } from "react";
import { RiSendPlane2Line } from "react-icons/ri";
import { useIntl } from "react-intl";
import {
  RangeSensor as RangeSensorType,
  SensorStateKey,
  SimulatorState,
} from "../device/simulator";
import RangeSensor from "./RangeSensor";

interface AccelerometerModuleProps {
  icon: ReactNode;
  state: SimulatorState;
  onValueChange: (id: SensorStateKey, value: any) => void;
  minimised: boolean;
}

const AccelerometerModule = ({
  icon,
  state,
  onValueChange,
  minimised,
}: AccelerometerModuleProps) => (
  <Stack spacing={5}>
    <Gesture icon={icon} state={state} onValueChange={onValueChange} />
    {!minimised && (
      <>
        <Axis
          axis="accelerometerX"
          label="x"
          state={state}
          onValueChange={onValueChange}
        />
        <Axis
          axis="accelerometerY"
          label="y"
          state={state}
          onValueChange={onValueChange}
        />
        <Axis
          axis="accelerometerZ"
          label="z"
          state={state}
          onValueChange={onValueChange}
        />
      </>
    )}
  </Stack>
);

interface GestureProps {
  icon: ReactNode;
  state: SimulatorState;
  onValueChange: (id: SensorStateKey, value: any) => void;
}

const Gesture = ({ icon, state, onValueChange }: GestureProps) => {
  const sensor = state.gesture;
  if (sensor.type !== "enum") {
    throw new Error("Unexpected sensor type");
  }
  // We omit "none" as we flip from "none" to the choice and back to "none".
  const choices = sensor.choices.filter((x) => x !== "none");
  const [choice, setChoice] = useState("shake");
  const [active, setActive] = useState(false);
  const intl = useIntl();

  const handleSelectChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setChoice(e.currentTarget.value);
    },
    [setChoice]
  );
  const handleClick = useCallback(() => {
    setActive(true);
    onValueChange("gesture", choice);
    setTimeout(() => {
      setActive(false);
      onValueChange("gesture", "none");
    }, 500);
  }, [setActive, onValueChange, choice]);

  return (
    <HStack spacing={3}>
      {icon}
      <Select
        data-testid="simulator-gesture-select"
        aria-label={intl.formatMessage({ id: "simulator-gesture-select" })}
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
        disabled={active}
        onClick={handleClick}
        aria-label={intl.formatMessage({ id: "simulator-gesture-send" })}
      ></IconButton>
    </HStack>
  );
};

interface AxisProps {
  axis: SensorStateKey;
  label: string;
  state: SimulatorState;
  onValueChange: (id: SensorStateKey, value: any) => void;
}

const Axis = ({
  axis,
  label,
  state,
  onValueChange: onSensorChange,
}: AxisProps) => (
  <RangeSensor
    id={axis}
    title={label}
    icon={
      <Text boxSize={6} textAlign="center">
        {label}
      </Text>
    }
    sensor={state[axis] as RangeSensorType}
    onSensorChange={onSensorChange}
  />
);

export default AccelerometerModule;
