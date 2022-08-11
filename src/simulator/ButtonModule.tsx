/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button, HStack, Switch } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Sensor } from "./model";
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
  const sensor = sensors["button" + buttonLabel.toUpperCase()];
  const [isPressedOverride, setIsPressedOverride] = useState<boolean>(false);
  const handleSensorChange = useCallback(
    (value: boolean, override: boolean = false) => {
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
            handleSensorChange(true);
          } else {
            handleSensorChange(false);
          }
      }
    };
    const mouseDownListener = (event: MouseEvent) => {
      event.preventDefault();
      handleSensorChange(true);
    };
    const mouseUpListener = (event: MouseEvent) => {
      event.preventDefault();
      handleSensorChange(false);
    };
    const mouseLeaveListener = () => {
      handleSensorChange(false);
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
  }, [handleSensorChange]);
  const handleOverrideSet = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsPressedOverride(event.currentTarget.checked);
    handleSensorChange(event.currentTarget.checked, true);
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
