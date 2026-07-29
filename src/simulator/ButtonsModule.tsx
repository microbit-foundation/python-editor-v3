/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text } from "@microbit/ui";
import { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import { HStack, VStack } from "styled-system/jsx";
import { SensorStateKey, SimulatorState } from "../device/simulator";
import SensorInput from "./SensorInput";
import { RunningStatus } from "./Simulator";

interface ButtonsModuleProps {
  icon: ReactNode;
  state: SimulatorState;
  onValueChange: (id: SensorStateKey, value: any) => void;
  running: RunningStatus;
  minimised: boolean;
}

const ButtonsModule = ({
  icon,
  state,
  onValueChange,
  running,
  minimised,
}: ButtonsModuleProps) => {
  return (
    <HStack gap="3">
      <VStack gap="3" alignItems="flex-start">
        {minimised ? (
          icon
        ) : (
          <>
            <Text height="8" fontSize="sm" alignItems="center" display="flex">
              <FormattedMessage id="simulator-input-press" />
            </Text>
            <Text fontSize="sm">
              <FormattedMessage id="simulator-input-hold" />
            </Text>
          </>
        )}
      </VStack>
      <HStack gap="2">
        <SensorInput
          type="button"
          sensorId="buttonA"
          label="A"
          state={state}
          onValueChange={onValueChange}
          running={running}
          minimised={minimised}
        />
        <SensorInput
          type="button"
          sensorId="buttonB"
          label="B"
          state={state}
          onValueChange={onValueChange}
          running={running}
          minimised={minimised}
        />
      </HStack>
    </HStack>
  );
};

export default ButtonsModule;
