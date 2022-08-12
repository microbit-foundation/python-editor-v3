/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button, HStack, Switch } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const [isPressedOverride, setIsPressedOverride] = useState<boolean>(false);
  const handleSensorChange = useCallback(
    (value: number, override: boolean = false) => {
      if ((isPressedOverride && override) || !isPressedOverride) {
        onSensorChange(sensor.id, value);
      }
    },
    [isPressedOverride, onSensorChange, sensor]
  );
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const buttonEl = ref.current;
    const keyListener = (event: KeyboardEvent) => {
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
    const mouseDownListener = (event: MouseEvent) => {
      event.preventDefault();
      handleSensorChange(sensor.max);
    };
    const mouseUpListener = (event: MouseEvent) => {
      event.preventDefault();
      handleSensorChange(sensor.min);
    };
    const mouseLeaveListener = () => {
      handleSensorChange(sensor.min);
    };
    if (buttonEl) {
      buttonEl.addEventListener("mousedown", mouseDownListener);
      buttonEl.addEventListener("mouseup", mouseUpListener);
      buttonEl.addEventListener("keydown", keyListener);
      buttonEl.addEventListener("keyup", keyListener);
      buttonEl.addEventListener("mouseleave", mouseLeaveListener);
    }
    return () => {
      if (buttonEl) {
        buttonEl.removeEventListener("mousedown", mouseDownListener);
        buttonEl.removeEventListener("mouseup", mouseUpListener);
        buttonEl.removeEventListener("keydown", keyListener);
        buttonEl.removeEventListener("keyup", keyListener);
        buttonEl.removeEventListener("mouseleave", mouseLeaveListener);
      }
    };
  }, [handleSensorChange, sensor]);
  const handleOverrideSet = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsPressedOverride(event.currentTarget.checked);
    handleSensorChange(
      event.currentTarget.checked ? sensor.max : sensor.min,
      true
    );
  };
  const disabled = simState === SimState.STOPPED;
  useEffect(() => {
    if (disabled) {
      setIsPressedOverride(false);
    }
  }, [disabled]);
  return (
    <HStack spacing={3}>
      <Button disabled={disabled} size="sm" ref={ref}>
        {buttonLabel}
      </Button>
      <Switch
        disabled={disabled}
        isChecked={isPressedOverride}
        onChange={handleOverrideSet}
      />
    </HStack>
  );
};
export default ButtonsModule;
