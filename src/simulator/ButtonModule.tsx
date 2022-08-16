/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { HStack, Text, VStack } from "@chakra-ui/react";
import { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import { Sensor } from "./model";
import SensorInput from "./SensorInput";
import { SimState } from "./Simulator";

interface ButtonsModuleProps {
  icon: ReactNode;
  sensors: Record<string, Sensor>;
  onSensorChange: (id: string, value: any) => void;
  simState: SimState;
  minimised: boolean;
}

const ButtonsModule = ({
  icon,
  sensors,
  onSensorChange,
  simState,
  minimised,
}: ButtonsModuleProps) => {
  return (
    <HStack spacing={3}>
      <VStack spacing={3} alignItems="flex-start">
        {minimised ? (
          icon
        ) : (
          <>
            <Text height={8} alignItems="center" display="flex">
              <FormattedMessage id="simulator-button-press" />
            </Text>
            <Text>
              <FormattedMessage id="simulator-button-hold" />
            </Text>
          </>
        )}
      </VStack>
      <SensorInput
        type="button"
        sensorId="buttonA"
        label="A"
        sensors={sensors}
        onSensorChange={onSensorChange}
        simState={simState}
        minimised={minimised}
      />
      <SensorInput
        type="button"
        sensorId="buttonB"
        label="B"
        sensors={sensors}
        onSensorChange={onSensorChange}
        simState={simState}
        minimised={minimised}
      />
    </HStack>
  );
};

export default ButtonsModule;
