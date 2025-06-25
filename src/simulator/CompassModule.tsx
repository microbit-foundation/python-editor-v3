/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, HStack, Icon, Stack, Text } from "@chakra-ui/react";
import { ReactNode, useEffect, useRef } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
  RangeSensor as RangeSensorType,
  SensorStateKey,
  SimulatorState,
} from "../device/simulator";
import Axis from "./Axis";
import CompassHeadingIcon from "./icons/compass-heading.svg?react";
import RangeSensor from "./RangeSensor";

interface CompassModuleProps {
  icon: ReactNode;
  state: SimulatorState;
  onValueChange: (id: SensorStateKey, value: any) => void;
  minimised: boolean;
}

const CompassModule = ({
  icon,
  state,
  onValueChange,
  minimised,
}: CompassModuleProps) => {
  const ref = useRef<SVGSVGElement>(null);
  const intl = useIntl();
  const compassHeading = state["compassHeading"];
  useEffect(() => {
    const needle = ref.current?.querySelector("#Needle");
    if (needle) {
      (
        needle as HTMLElement
      ).style.transform = `rotate(${compassHeading.value}deg)`;
    }
  }, [compassHeading]);
  return (
    <Box>
      {minimised ? (
        <RangeSensor
          id="compassHeading"
          icon={icon}
          title={intl.formatMessage({ id: "simulator-compass-heading-one" })}
          sensor={compassHeading as RangeSensorType}
          onSensorChange={onValueChange}
          minimised={minimised}
        />
      ) : (
        <>
          <Text as="h4" fontSize="sm">
            <FormattedMessage id="simulator-compass-heading-one" />
          </Text>
          <HStack spacing={3} pl={4} width="100%">
            <RangeSensor
              id="compassHeading"
              title={intl.formatMessage({
                id: "simulator-compass-heading-one",
              })}
              sensor={compassHeading as RangeSensorType}
              onSensorChange={onValueChange}
              minimised={minimised}
            />
            <Icon ref={ref} color="blimpTeal.400" boxSize="20">
              <CompassHeadingIcon />
            </Icon>
          </HStack>
          <Stack spacing={5} mt={5}>
            <Text as="h4" fontSize="sm">
              <FormattedMessage id="simulator-compass-heading-two" />
            </Text>
            <Axis
              axis="compassX"
              label="x"
              state={state}
              onValueChange={onValueChange}
            />
            <Axis
              axis="compassY"
              label="y"
              state={state}
              onValueChange={onValueChange}
            />
            <Axis
              axis="compassZ"
              label="z"
              state={state}
              onValueChange={onValueChange}
            />
          </Stack>
        </>
      )}
    </Box>
  );
};

export default CompassModule;
