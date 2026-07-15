/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Box,
  Button,
  HStack,
  IconButton,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Stack,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useIntl } from "react-intl";
import ExpandCollapseIcon from "../common/ExpandCollapseIcon";
import { useParsedRoles } from "../jacdac/jacdac-hooks";
import { ParsedRole } from "../jacdac/parse-roles";
import { labelForRoleType } from "../jacdac/supported-services";

/**
 * Simulator "Jacdac" section (step 7), populated from the roles in the user's
 * code. One widget per role — a press button for buttons, a linear slider for
 * sliders, and a centre-zero expanding slider for (unbounded) rotary encoders.
 *
 * Rendered in two positions: it sits at the BOTTOM (empty) when there are no
 * Jacdac roles, and floats to the TOP when populated. Only the instance for the
 * current state renders; the other returns null.
 *
 * Widgets are interactive but scoped to the simulator UI only; they don't drive
 * the user's program yet (running Jacdac in the simulator needs Task 1).
 */
const JacdacSimulatorSection = ({
  position,
}: {
  position: "top" | "bottom";
}) => {
  const intl = useIntl();
  const roles = useParsedRoles();
  const disclosure = useDisclosure({ defaultIsOpen: true });
  const title = intl.formatMessage({ id: "jacdac-tab" });
  const populated = roles.length > 0;

  // Populated → top; empty → bottom. The other instance renders nothing.
  if (populated !== (position === "top")) {
    return null;
  }

  if (!populated) {
    return (
      <Stack borderTopWidth={1} borderColor="grey.200" pt={5} spacing={2}>
        <Text as="h3" fontWeight="semibold">
          {title}
        </Text>
        <Text fontSize="sm" color="gray.600">
          Add Jacdac sensors in your code to simulate them here.
        </Text>
      </Stack>
    );
  }

  return (
    <Stack
      borderBottomWidth={1}
      borderColor="grey.200"
      pb={5}
      mb={3}
      spacing={5}
    >
      <HStack justifyContent="space-between">
        <Text as="h3" fontWeight="semibold">
          {title}
        </Text>
        <IconButton
          alignSelf="flex-start"
          icon={<ExpandCollapseIcon open={disclosure.isOpen} />}
          aria-label={
            disclosure.isOpen
              ? intl.formatMessage({ id: "simulator-collapse-module" }, { title })
              : intl.formatMessage({ id: "simulator-expand-module" }, { title })
          }
          size="sm"
          color="brand.200"
          variant="ghost"
          fontSize="2xl"
          onClick={disclosure.onToggle}
        />
      </HStack>
      {disclosure.isOpen && (
        <VStack align="stretch" spacing={4}>
          {roles.map((role) => (
            <JacdacSimSensor key={role.name} role={role} />
          ))}
        </VStack>
      )}
    </Stack>
  );
};

const JacdacSimSensor = ({ role }: { role: ParsedRole }) => (
  <Box>
    <Text fontSize="sm" fontWeight="semibold" lineHeight="short">
      {role.name}
    </Text>
    <Text fontSize="xs" color="gray.600" mb={1}>
      {labelForRoleType(role.type)}
    </Text>
    {role.type === "button" ? (
      <SimButton />
    ) : role.type === "rotary-encoder" ? (
      <SimRotary />
    ) : (
      <SimSlider />
    )}
  </Box>
);

const SimButton = () => {
  const [pressed, setPressed] = useState(false);
  return (
    <Button
      size="sm"
      variant={pressed ? "solid" : "outline"}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
    >
      {pressed ? "Pressed" : "Press"}
    </Button>
  );
};

const SimSlider = () => {
  const [value, setValue] = useState(0);
  return <ValueSlider value={value} min={0} max={100} onChange={setValue} />;
};

/**
 * Rotary encoders are relative and unbounded, so a -/+ stepper with a typeable
 * field fits better than a slider: no bounds, no runaway.
 */
const SimRotary = () => {
  const [value, setValue] = useState(0);
  return (
    <NumberInput
      size="sm"
      maxW="8rem"
      value={value}
      step={1}
      onChange={(_, valueAsNumber) =>
        setValue(Number.isNaN(valueAsNumber) ? 0 : valueAsNumber)
      }
    >
      <NumberInputField />
      <NumberInputStepper>
        <NumberIncrementStepper />
        <NumberDecrementStepper />
      </NumberInputStepper>
    </NumberInput>
  );
};

interface ValueSliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

const ValueSlider = ({ value, min, max, onChange }: ValueSliderProps) => (
  <HStack spacing={3}>
    <Slider
      aria-label="value"
      value={value}
      min={min}
      max={max}
      onChange={onChange}
      colorScheme="blackAlpha"
      flex="1 1 auto"
    >
      <SliderTrack height={2}>
        <SliderFilledTrack />
      </SliderTrack>
      <SliderThumb />
    </Slider>
    <Text fontSize="xs" minW="4ch" textAlign="right">
      {value}
    </Text>
  </HStack>
);

export default JacdacSimulatorSection;
