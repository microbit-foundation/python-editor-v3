/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button, HStack, Switch } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { RangeSensor as RangeSensorType, Sensor } from "./model";
import { SimState } from "./Simulator";

interface ButtonsModuleProps {
  sensors: Record<string, Sensor>;
  onSensorChange: (id: string, value: any) => void;
  simState: SimState;
}

const ButtonsModule = ({
  sensors,
  onSensorChange,
  simState,
}: ButtonsModuleProps) => {
  return (
    <HStack spacing={5}>
      <SensorButton
        buttonLabel="A"
        sensors={sensors}
        onSensorChange={onSensorChange}
        simState={simState}
      />
      <SensorButton
        buttonLabel="B"
        sensors={sensors}
        onSensorChange={onSensorChange}
        simState={simState}
      />
    </HStack>
  );
};

interface SensorButtonProps extends ButtonsModuleProps {
  buttonLabel: string;
}

const SensorButton = ({
  buttonLabel,
  sensors,
  onSensorChange,
  simState,
}: SensorButtonProps) => {
  const sensor = sensors[
    "button" + buttonLabel.toUpperCase()
  ] as RangeSensorType;
  const [mouseDown, setMouseDown] = useState<boolean>(false);
  const handleSensorChange = useCallback(
    (value: number) => {
      // In this case isHeld is true, so the value should be reversed.
      if (sensor.value === value) {
        onSensorChange(
          sensor.id,
          value === sensor.min ? sensor.max : sensor.min
        );
      } else {
        onSensorChange(sensor.id, value);
      }
    },
    [onSensorChange, sensor]
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
  const mouseDownListener = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    setMouseDown(true);
    handleSensorChange(sensor.max);
  };
  const mouseUpListener = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    setMouseDown(false);
    handleSensorChange(sensor.min);
  };
  const mouseLeaveListener = () => {
    if (mouseDown) {
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

  useEffect(() => {
    if (sensor.value === sensor.min) {
      setIsHeld(false);
    }
    if (sensor.value === sensor.max) {
      setIsHeld(true);
    }
  }, [sensor]);

  const disabled = simState === SimState.STOPPED;

  return (
    <HStack spacing={3}>
      <Button
        isActive={!!sensor.value}
        disabled={disabled}
        size="sm"
        onKeyDown={keyListener}
        onKeyUp={keyListener}
        onMouseDown={mouseDownListener}
        onMouseUp={mouseUpListener}
        onMouseLeave={mouseLeaveListener}
      >
        {buttonLabel}
      </Button>
      <Switch
        sx={{
          "*": {
            transition: "none !important",
          },
        }}
        isChecked={isHeld}
        onChange={handleOverrideSet}
      />
    </HStack>
  );
};
export default ButtonsModule;
