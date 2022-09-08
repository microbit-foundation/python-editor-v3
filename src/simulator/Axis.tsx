/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text } from "@chakra-ui/react";
import {
  RangeSensor as RangeSensorType,
  SensorStateKey,
  SimulatorState,
} from "../device/simulator";
import RangeSensor from "./RangeSensor";

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
      label ? (
        <Text boxSize={6} textAlign="center">
          {label}
        </Text>
      ) : (
        ""
      )
    }
    sensor={state[axis] as RangeSensorType}
    onSensorChange={onSensorChange}
  />
);

export default Axis;
