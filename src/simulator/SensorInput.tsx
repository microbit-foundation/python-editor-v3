/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Button, Switch, VStack } from "@chakra-ui/react";
import { ReactNode, useCallback, useState } from "react";
import { useIntl } from "react-intl";
import { RangeSensor as RangeSensorType, Sensor } from "./model";
import { SimState } from "./Simulator";

interface SensorInputProps {
  type: "button" | "pin";
  label: string;
  logo?: ReactNode;
  sensorId: string;
  sensors: Record<string, Sensor>;
  onSensorChange: (id: string, value: any) => void;
  simState: SimState;
  minimised: boolean;
}

const SensorInput = ({
  type,
  label,
  logo,
  sensorId,
  sensors,
  onSensorChange,
  simState,
  minimised,
}: SensorInputProps) => {
  const sensor = sensors[sensorId] as RangeSensorType;
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
    if (mouseDown) {
      setMouseDown(false);
      handleSensorChange(sensor.min);
    }
  };
  const mouseLeaveListener = () => {
    if (mouseDown) {
      setMouseDown(false);
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
          { id: `simulator-${type}-press-label` },
          { [type]: label }
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
          colorScheme="blackAlpha"
          isChecked={isHeld}
          onChange={handleOverrideSet}
        />
      )}
    </VStack>
  );
};

export default SensorInput;
