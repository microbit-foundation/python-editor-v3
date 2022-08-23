/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { HStack, Text, VStack } from "@chakra-ui/react";
import { ReactNode } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useDeployment } from "../deployment";
import { Sensor } from "./model";
import SensorInput from "./SensorInput";
import { SimState } from "./Simulator";

export interface PinsModuleProps {
  icon: ReactNode;
  sensors: Record<string, Sensor>;
  onSensorChange: (id: string, value: any) => void;
  simState: SimState;
  minimised: boolean;
}

const PinsModule = ({
  icon,
  sensors,
  onSensorChange,
  simState,
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
            <Text height={8} alignItems="center" display="flex">
              <FormattedMessage id="simulator-input-press" />
            </Text>
            <Text>
              <FormattedMessage id="simulator-input-hold" />
            </Text>
          </>
        )}
      </VStack>
      <SensorInput
        type="pin"
        sensorId="pin0"
        label="0"
        sensors={sensors}
        onSensorChange={onSensorChange}
        simState={simState}
        minimised={minimised}
      />
      <SensorInput
        type="pin"
        sensorId="pin1"
        label="1"
        sensors={sensors}
        onSensorChange={onSensorChange}
        simState={simState}
        minimised={minimised}
      />
      <SensorInput
        type="pin"
        sensorId="pin2"
        label="2"
        sensors={sensors}
        onSensorChange={onSensorChange}
        simState={simState}
        minimised={minimised}
      />
      <SensorInput
        type="pin"
        sensorId="pinLogo"
        label={touchLogoLabel}
        logo={brand.squareLogo}
        sensors={sensors}
        onSensorChange={onSensorChange}
        simState={simState}
        minimised={minimised}
      />
    </HStack>
  );
};

export default PinsModule;
