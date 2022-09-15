/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { HStack, Text, VStack } from "@chakra-ui/react";
import { ReactNode } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useDeployment } from "../deployment";
import { SensorStateKey, SimulatorState } from "../device/simulator";
import SensorInput from "./SensorInput";
import { RunningStatus } from "./Simulator";

export interface PinsModuleProps {
  icon: ReactNode;
  state: SimulatorState;
  onValueChange: (id: SensorStateKey, value: any) => void;
  running: RunningStatus;
  minimised: boolean;
}

const PinsModule = ({
  icon,
  state,
  onValueChange,
  running: simState,
  minimised,
}: PinsModuleProps) => {
  const brand = useDeployment();
  const intl = useIntl();
  const touchLogoLabel = intl.formatMessage({ id: "simulator-touch-logo" });
  return (
    <HStack spacing={3}>
      <VStack spacing={3} alignItems="flex-start">
        {minimised ? (
          icon
        ) : (
          <>
            <Text height={8} fontSize="sm" alignItems="center" display="flex">
              <FormattedMessage id="simulator-input-press" />
            </Text>
            <Text fontSize="sm">
              <FormattedMessage id="simulator-input-hold" />
            </Text>
          </>
        )}
      </VStack>
      <HStack spacing={2}>
        <SensorInput
          type="pin"
          sensorId="pin0"
          label="0"
          state={state}
          onValueChange={onValueChange}
          running={simState}
          minimised={minimised}
        />
        <SensorInput
          type="pin"
          sensorId="pin1"
          label="1"
          state={state}
          onValueChange={onValueChange}
          running={simState}
          minimised={minimised}
        />
        <SensorInput
          type="pin"
          sensorId="pin2"
          label="2"
          state={state}
          onValueChange={onValueChange}
          running={simState}
          minimised={minimised}
        />
        <SensorInput
          type="pin"
          sensorId="pinLogo"
          label={touchLogoLabel}
          logo={brand.squareLogo}
          state={state}
          onValueChange={onValueChange}
          running={simState}
          minimised={minimised}
        />
      </HStack>
    </HStack>
  );
};

export default PinsModule;
