/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Box,
  Button,
  HStack,
  Icon,
  IconButton,
  NumberInput,
  NumberInputField,
  Select,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
} from "@chakra-ui/react";
import { PackedValues } from "jacdac-ts";
import { useEffect, useState } from "react";
import { RiSearchEyeLine } from "react-icons/ri";
import { useIntl } from "react-intl";
import ButtonPressIcon from "../simulator/icons/button-press.svg?react";
import { useJacdacAssignments } from "./jacdac-assignments";
import {
  useJacdacIdentify,
  useJacdacReading,
  useJacdacSensorServices,
} from "./jacdac-hooks";
import { JacdacRoleType } from "./parse-roles";

/**
 * Live reading of a connected sensor at the top of its docs section: a dropdown
 * to pick which sensor (always shown when connected), an identify button pinned
 * to its right, and a read-only simulator-style widget underneath that reflects
 * the current reading — a button showing pressed state, a read-only slider, or a
 * read-only number for a rotary encoder. Only input sensor types; self-hides
 * when nothing of the type is connected.
 */
const LIVE_STATUS_TYPES = new Set<JacdacRoleType>([
  "button",
  "slider",
  "rotary-encoder",
]);

// A button-styled status that shows pressed state. It mirrors the hardware and
// isn't interactive, so it's role="img" with a label describing the current
// state (a "read-only button" / aria-pressed would wrongly imply a control).
const ReadonlyButton = ({ pressed }: { pressed: boolean }) => (
  <Button
    as="div"
    size="sm"
    isActive={pressed}
    _active={{ background: "brand.100" }}
    cursor="default"
    role="img"
    aria-label={pressed ? "Pressed" : "Not pressed"}
  >
    <Icon as={ButtonPressIcon} boxSize={4} />
  </Button>
);

const ReadonlySlider = ({ value }: { value: number }) => (
  <HStack spacing={3}>
    <Slider
      aria-label="value"
      value={value}
      min={0}
      max={100}
      isReadOnly
      colorScheme="blackAlpha"
      flex="1 1 auto"
    >
      <SliderTrack height={2}>
        <SliderFilledTrack />
      </SliderTrack>
      <SliderThumb />
    </Slider>
    <Text fontSize="xs" minW="3ch" textAlign="right">
      {value}
    </Text>
  </HStack>
);

const ReadonlyNumber = ({ value }: { value: number }) => (
  <NumberInput size="sm" isReadOnly value={value} maxW="7rem">
    <NumberInputField />
  </NumberInput>
);

const LiveReadout = ({
  type,
  reading,
}: {
  type: JacdacRoleType;
  reading: PackedValues | undefined;
}) => {
  const raw =
    reading && reading.length > 0 && reading[0] !== undefined
      ? Number(reading[0])
      : undefined;
  switch (type) {
    case "button":
      // pressure is 0..1; pressed when non-zero.
      return <ReadonlyButton pressed={raw !== undefined && raw > 0} />;
    case "slider":
      // position is 0..1; show 0..100.
      return <ReadonlySlider value={raw === undefined ? 0 : Math.round(raw * 100)} />;
    case "rotary-encoder":
      // position is a signed click count.
      return <ReadonlyNumber value={raw === undefined ? 0 : Math.round(raw)} />;
    default:
      return null;
  }
};

const JacdacLiveStatus = ({ type }: { type: JacdacRoleType }) => {
  const intl = useIntl();
  const services = useJacdacSensorServices().filter(
    (s) => s.supported.type === type
  );
  const { assignments } = useJacdacAssignments();
  const identify = useJacdacIdentify();

  const [selectedKey, setSelectedKey] = useState<string | undefined>(undefined);
  // Keep the selection valid as sensors connect/disconnect.
  useEffect(() => {
    setSelectedKey((current) =>
      current && services.some((s) => s.key === current)
        ? current
        : services[0]?.key
    );
  }, [services]);

  const selected = services.find((s) => s.key === selectedKey) ?? services[0];
  const reading = useJacdacReading(selected?.service);

  if (!LIVE_STATUS_TYPES.has(type) || services.length === 0) {
    return null;
  }

  const identifyLabel = intl.formatMessage({ id: "jacdac-identify-action" });
  // The slider needs width, so it gets its own row; button/rotary sit inline.
  const isSlider = type === "slider";

  const selectEl = (
    <Select
      size="sm"
      maxW="11rem"
      value={selected?.key}
      onChange={(e) => setSelectedKey(e.target.value)}
    >
      {services.map((s) => (
        <option key={s.key} value={s.key}>
          {assignments[s.key] || s.device.shortId}
        </option>
      ))}
    </Select>
  );
  const identifyEl = selected ? (
    <IconButton
      size="sm"
      variant="outline"
      flexShrink={0}
      aria-label={identifyLabel}
      title={identifyLabel}
      icon={<RiSearchEyeLine />}
      onClick={() => void identify(selected.device.deviceId)}
    />
  ) : null;

  return (
    <Box
      mx={5}
      mt={4}
      mb={1}
      p={3}
      width={isSlider ? undefined : "fit-content"}
      maxW={isSlider ? "24rem" : "100%"}
      borderWidth={1}
      borderColor="gray.200"
      borderRadius="md"
      bg="gray.10"
    >
      <Text fontSize="xs" color="gray.600" mb={2}>
        Live sensor
      </Text>
      {isSlider ? (
        // Dropdown + identify on top, the slider full-width underneath.
        <>
          <HStack spacing={2} align="center" justifyContent="space-between" mb={3}>
            {selectEl}
            {identifyEl}
          </HStack>
          <LiveReadout type={type} reading={reading} />
        </>
      ) : (
        // Everything on one row for the compact button / rotary readouts.
        <HStack spacing={2} align="center">
          {selectEl}
          <LiveReadout type={type} reading={reading} />
          {identifyEl}
        </HStack>
      )}
    </Box>
  );
};

export default JacdacLiveStatus;
