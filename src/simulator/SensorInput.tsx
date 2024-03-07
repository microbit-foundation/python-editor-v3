/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Button, Switch, VStack } from "@chakra-ui/react";
import { ReactNode, useCallback, useRef, useState } from "react";
import { useIntl } from "react-intl";
import {
  RangeSensor as RangeSensorType,
  SensorStateKey,
  SimulatorState,
} from "../device/simulator";
import { RunningStatus } from "./Simulator";

interface SensorInputProps {
  type: "button" | "pin";
  label: string;
  logo?: ReactNode;
  sensorId: SensorStateKey;
  state: SimulatorState;
  onValueChange: (id: SensorStateKey, value: any) => void;
  running: RunningStatus;
  minimised: boolean;
}

const SensorInput = ({
  type,
  label,
  logo,
  sensorId,
  state,
  onValueChange,
  running,
  minimised,
}: SensorInputProps) => {
  const sensor = state[sensorId] as RangeSensorType;
  const sensorValue = useRef<number>(sensor.value);
  const intl = useIntl();
  const mouseDown = useRef<boolean>(false);
  const handleSensorChange = useCallback(
    (value: number) => {
      // In this case isHeld is true, so the value should be reversed.
      if (sensorValue.current === value) {
        onValueChange(sensorId, value === sensor.min ? sensor.max : sensor.min);
        sensorValue.current = value === sensor.min ? sensor.max : sensor.min;
      } else {
        onValueChange(sensorId, value);
        sensorValue.current = value;
      }
    },
    [onValueChange, sensor, sensorId]
  );
  const keyListener = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        if (event.type === "keydown") {
          handleSensorChange(sensor.max);
        } else {
          handleSensorChange(sensor.min);
        }
    }
  };
  const mouseDownTouchStartAction = () => {
    mouseDown.current = true;
    handleSensorChange(sensor.max);
  };
  const mouseUpTouchEndAction = () => {
    if (mouseDown.current) {
      mouseDown.current = false;
      handleSensorChange(sensor.min);
    }
  };
  const mouseDownListener = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    mouseDownTouchStartAction();
  };
  const mouseUpListener = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    mouseUpTouchEndAction();
  };
  const touchEndListener = (event: React.TouchEvent) => {
    event.preventDefault();
    mouseUpTouchEndAction();
  };
  const mouseLeaveListener = () => {
    if (mouseDown.current) {
      mouseDown.current = false;
      handleSensorChange(sensor.min);
    }
  };
  const [isHeld, setIsHeld] = useState<boolean>(false);
  const handleOverrideSet = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setIsHeld(event.currentTarget.checked);
      handleSensorChange(event.currentTarget.checked ? sensor.max : sensor.min);
    },
    [handleSensorChange, setIsHeld, sensor]
  );

  const [prevSensorValue, setPrevSensorValue] = useState(sensor.value);
  if (sensor.value !== prevSensorValue) {
    if (sensor.value === sensor.min) {
      setIsHeld(false);
    } else if (sensor.value === sensor.max) {
      setIsHeld(true);
    }
    sensorValue.current = sensor.value;
    setPrevSensorValue(sensor.value);
  }

  const disabled = running === RunningStatus.STOPPED;
  return (
    <VStack spacing={3}>
      <Button
        aria-label={intl.formatMessage(
          { id: `simulator-${type}-press-label` },
          { [type]: label }
        )}
        transition="none"
        _active={
          sensorValue.current === sensor.min
            ? {}
            : {
                background: "brand.100",
              }
        }
        isActive={!!sensorValue.current}
        isDisabled={disabled}
        size="sm"
        onKeyDown={keyListener}
        onKeyUp={keyListener}
        onMouseDown={mouseDownListener}
        onTouchStart={mouseDownTouchStartAction}
        onMouseUp={mouseUpListener}
        onTouchEnd={touchEndListener}
        onMouseLeave={mouseLeaveListener}
      >
        {logo ? (
          <Box width={5} role="img">
            {logo}
          </Box>
        ) : (
          label
        )}
      </Button>
      {!minimised && (
        <Switch
          aria-label={intl.formatMessage(
            { id: `simulator-${type}-hold-label` },
            { [type]: label }
          )}
          sx={{
            "*": {
              transition: "none !important",
            },
          }}
          isChecked={isHeld}
          onChange={handleOverrideSet}
        />
      )}
    </VStack>
  );
};

export default SensorInput;
