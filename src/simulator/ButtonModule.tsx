/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button, HStack, Switch, Text, VStack } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { RangeSensor as RangeSensorType, Sensor } from "./model";
import { SimState } from "./Simulator";

interface ButtonsModuleProps {
  sensors: Record<string, Sensor>;
  onSensorChange: (id: string, value: any) => void;
  simState: SimState;
  minimised: boolean;
}

const ButtonsModule = ({
  sensors,
  onSensorChange,
  simState,
  minimised,
}: ButtonsModuleProps) => {
  return (
    <HStack spacing={5}>
      <VStack spacing={3} alignItems="flex-start">
        <Text height={8} alignItems="center" display="flex">
          <FormattedMessage id="simulator-button-press" />
        </Text>
        {!minimised && (
          <Text>
            <FormattedMessage id="simulator-button-hold" />
          </Text>
        )}
      </VStack>
      <SensorButton
        buttonLabel="A"
        sensors={sensors}
        onSensorChange={onSensorChange}
        simState={simState}
        minimised={minimised}
      />
      <SensorButton
        buttonLabel="B"
        sensors={sensors}
        onSensorChange={onSensorChange}
        simState={simState}
        minimised={minimised}
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
  minimised,
}: SensorButtonProps) => {
  const sensor = sensors[
    "button" + buttonLabel.toUpperCase()
  ] as RangeSensorType;
  const intl = useIntl();
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

  const [prevSensorValue, setPrevSensorValue] = useState(sensor.value);
  if (sensor.value !== prevSensorValue) {
    if (sensor.value === sensor.min) {
      setIsHeld(false);
    } else if (sensor.value === sensor.max) {
      setIsHeld(true);
    }
    setPrevSensorValue(sensor.value);
  }

  const disabled = simState === SimState.STOPPED;

  return (
    <VStack spacing={3}>
      <Button
        aria-label={intl.formatMessage(
          { id: "simulator-button-press-label" },
          { button: buttonLabel }
        )}
        transition="none"
        _active={
          sensor.value === sensor.min
            ? {}
            : {
                background: "brand.100",
              }
        }
        isActive={!!sensor.value}
        disabled={disabled}
        size="sm"
        colorScheme="blackAlpha"
        onKeyDown={keyListener}
        onKeyUp={keyListener}
        onMouseDown={mouseDownListener}
        onMouseUp={mouseUpListener}
        onMouseLeave={mouseLeaveListener}
      >
        {buttonLabel}
      </Button>
      {!minimised && (
        <Switch
          aria-label={intl.formatMessage(
            { id: "simulator-button-hold-label" },
            { button: buttonLabel }
          )}
          sx={{
            "*": {
              transition: "none !important",
            },
          }}
          colorScheme="blackAlpha"
          isChecked={isHeld}
          onChange={handleOverrideSet}
        />
      )}
    </VStack>
  );
};
export default ButtonsModule;
