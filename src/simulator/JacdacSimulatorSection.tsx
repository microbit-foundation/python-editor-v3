/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Box,
  Button,
  Circle,
  HStack,
  Icon,
  IconButton,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
  Switch,
  Text,
  Tooltip,
  useDisclosure,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { RiEqualizerLine, RiInformationLine } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import ExpandCollapseIcon from "../common/ExpandCollapseIcon";
import {
  RangeSensor as RangeSensorType,
  SensorStateKey,
} from "../device/simulator";
import { useJacdacAssignments } from "../jacdac/jacdac-assignments";
import { useParsedRoles } from "../jacdac/jacdac-hooks";
import { JacdacRoleType, ParsedRole } from "../jacdac/parse-roles";
import { useRouterState } from "../router-hooks";
import ButtonPressIcon from "./icons/button-press.svg?react";
import RangeSensor from "./RangeSensor";

/**
 * Simulator "Jacdac" section, populated from the roles in the user's code.
 *
 * Sensors are grouped by type into collapsible modules that match the built-in
 * simulator modules (expand/collapse, info icon linking to the Jacdac docs
 * section for that type). Within a group, each role is a widget: a press-and-hold
 * button with a hold toggle (like the board buttons), a linear slider, or a -/+
 * stepper for (relative, unbounded) rotary encoders.
 *
 * Rendered in two positions: it sits at the BOTTOM (empty) when there are no
 * Jacdac roles, and floats to the TOP when populated. Only the instance for the
 * current state renders; the other returns null.
 *
 * Widgets are interactive but scoped to the simulator UI only; they don't drive
 * the user's program yet (running Jacdac in the simulator needs Task 1).
 */
const TYPE_ORDER: JacdacRoleType[] = ["button", "rotary-encoder", "slider"];

const JacdacSimulatorSection = ({
  position,
}: {
  position: "top" | "bottom";
}) => {
  const intl = useIntl();
  const roles = useParsedRoles();
  const { connectedRoleNames } = useJacdacAssignments();
  const populated = roles.length > 0;

  // Populated → top; empty → bottom. The other instance renders nothing.
  if (populated !== (position === "top")) {
    return null;
  }

  if (!populated) {
    return (
      <Stack borderTopWidth={1} borderColor="grey.200" pt={5} spacing={2}>
        <Text as="h3" fontWeight="semibold">
          {intl.formatMessage({ id: "jacdac-tab" })}
        </Text>
        <Text fontSize="sm" color="gray.600">
          {intl.formatMessage({ id: "jacdac-sim-empty" })}
        </Text>
      </Stack>
    );
  }

  const groups = TYPE_ORDER.map((type) => ({
    type,
    roles: roles.filter((r) => r.type === type),
  })).filter((g) => g.roles.length > 0);

  return (
    <Stack spacing={0} borderBottomWidth={1} borderColor="grey.200" mb={3}>
      {groups.map((group, index) => (
        <JacdacTypeModule
          key={group.type}
          type={group.type}
          roles={group.roles}
          connectedRoleNames={connectedRoleNames}
          index={index}
          isLast={index === groups.length - 1}
        />
      ))}
    </Stack>
  );
};

interface JacdacTypeModuleProps {
  type: JacdacRoleType;
  roles: ParsedRole[];
  connectedRoleNames: Set<string>;
  index: number;
  isLast: boolean;
}

const JacdacTypeModule = ({
  type,
  roles,
  connectedRoleNames,
  index,
  isLast,
}: JacdacTypeModuleProps) => {
  const intl = useIntl();
  const disclosure = useDisclosure();
  const [, setRouterState] = useRouterState();
  const title = intl.formatMessage({ id: `jacdac-sim-group-${type}` });
  const handleLinkToDocs = () => {
    // Deep-link to the Jacdac sidebar section for this sensor type.
    setRouterState(
      { tab: "jacdac", slug: { id: type }, focus: true },
      "documentation-from-simulator"
    );
  };
  // The same widget is rendered whether open or minimised (passing `minimised`),
  // so a collapsed module stays usable — matching the built-in modules.
  const minimised = !disclosure.isOpen;
  const controls =
    type === "button" ? (
      <JacdacButtonGroup
        roles={roles}
        connectedRoleNames={connectedRoleNames}
        minimised={minimised}
      />
    ) : (
      <VStack align="stretch" spacing={minimised ? 3 : 6}>
        {roles.map((role) => (
          <Box key={role.name}>
            <RoleLabel
              role={role}
              connected={connectedRoleNames.has(role.name)}
            />
            {type === "rotary-encoder" ? (
              <SimRotary />
            ) : (
              // Extra top space (when open) for RangeSensor's floating value
              // mark, which sits above the thumb and would otherwise overlap the
              // role label.
              <Box pt={minimised ? 0 : 4}>
                <SimSlider title={role.name} minimised={minimised} />
              </Box>
            )}
          </Box>
        ))}
      </VStack>
    );
  return (
    <Stack
      borderBottomWidth={isLast ? 0 : 1}
      borderColor="grey.200"
      pb={disclosure.isOpen ? 5 : 3}
      mt={index === 0 ? 0 : 3}
      spacing={disclosure.isOpen ? 5 : 3}
    >
      <HStack justifyContent="space-between">
        {disclosure.isOpen && (
          <HStack>
            <Text as="h3" fontWeight="semibold">
              {title}
            </Text>
            <IconButton
              aria-label={intl.formatMessage({ id: "jacdac-sim-docs-link" })}
              icon={<RiInformationLine />}
              color="brand.500"
              variant="ghost"
              size="xs"
              fontSize="lg"
              onClick={handleLinkToDocs}
            />
          </HStack>
        )}
        {!disclosure.isOpen && <Box w="100%">{controls}</Box>}
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
      {disclosure.isOpen && controls}
    </Stack>
  );
};

const ConnectedDot = () => {
  const intl = useIntl();
  return (
    <Tooltip label={intl.formatMessage({ id: "jacdac-connected" })}>
      <Circle
        size="8px"
        bg="green.500"
        aria-label={intl.formatMessage({ id: "jacdac-connected" })}
      />
    </Tooltip>
  );
};

const RoleLabel = ({
  role,
  connected,
}: {
  role: ParsedRole;
  connected: boolean;
}) => (
  <HStack spacing={1.5} mb={1} minW={0}>
    <Text fontSize="sm" fontWeight="medium" isTruncated title={role.name}>
      {role.name}
    </Text>
    {connected && <ConnectedDot />}
  </HStack>
);

/**
 * Copies the board Buttons module: "Press"/"Hold" row labels on the left (an
 * icon when minimised), one button per role in a row, with a hold toggle beneath
 * each (hidden when minimised, but the button stays usable). Role names label the
 * button faces since they're longer than the board's "A"/"B".
 */
const JacdacButtonGroup = ({
  roles,
  connectedRoleNames,
  minimised,
}: {
  roles: ParsedRole[];
  connectedRoleNames: Set<string>;
  minimised: boolean;
}) => (
  <HStack spacing={3} alignItems="flex-start">
    {minimised ? (
      <Icon
        as={ButtonPressIcon}
        color="blimpTeal.400"
        boxSize="6"
        alignSelf="center"
      />
    ) : (
      <VStack spacing={3} alignItems="flex-start">
        <Text height={8} fontSize="sm" alignItems="center" display="flex">
          <FormattedMessage id="simulator-input-press" />
        </Text>
        <Text fontSize="sm">
          <FormattedMessage id="simulator-input-hold" />
        </Text>
      </VStack>
    )}
    <Wrap spacing={2}>
      {roles.map((role) => (
        <WrapItem key={role.name}>
          <JacdacButtonInput
            role={role}
            connected={connectedRoleNames.has(role.name)}
            minimised={minimised}
          />
        </WrapItem>
      ))}
    </Wrap>
  </HStack>
);

/**
 * A single Jacdac button, modelled on the board SensorInput: a press-and-hold
 * button with a hold toggle beneath (hidden when minimised). The role name is on
 * the button face, with a "connected" dot when backed by real hardware.
 */
const JacdacButtonInput = ({
  role,
  connected,
  minimised,
}: {
  role: ParsedRole;
  connected: boolean;
  minimised: boolean;
}) => {
  const intl = useIntl();
  const [pressed, setPressed] = useState(false);
  const [held, setHeld] = useState(false);
  const down = pressed || held;
  const press = () => setPressed(true);
  const release = () => setPressed(false);
  return (
    <VStack spacing={3}>
      <Box position="relative">
        <Button
          transition="none"
          _active={{ background: "brand.100" }}
          isActive={down}
          size="sm"
          maxW="7rem"
          aria-label={intl.formatMessage(
            { id: "simulator-button-press-label" },
            { button: role.name }
          )}
          onMouseDown={(e) => {
            e.preventDefault();
            press();
          }}
          onMouseUp={(e) => {
            e.preventDefault();
            release();
          }}
          onMouseLeave={release}
          onTouchStart={press}
          onTouchEnd={(e) => {
            e.preventDefault();
            release();
          }}
        >
          <Text isTruncated>{role.name}</Text>
        </Button>
        {connected && (
          <Tooltip label={intl.formatMessage({ id: "jacdac-connected" })}>
            <Circle
              position="absolute"
              top="-1"
              right="-1"
              size="10px"
              bg="green.500"
              borderWidth={2}
              borderColor="white"
              aria-label={intl.formatMessage({ id: "jacdac-connected" })}
            />
          </Tooltip>
        )}
      </Box>
      {!minimised && (
        <Switch
          sx={{ "*": { transition: "none !important" } }}
          isChecked={held}
          onChange={(e) => setHeld(e.currentTarget.checked)}
          aria-label={intl.formatMessage(
            { id: "simulator-button-hold-label" },
            { button: role.name }
          )}
        />
      )}
    </VStack>
  );
};

/**
 * A slider matching the built-in range-sensor sliders (min/max marks, value
 * tooltip on hover), with a generic icon. UI-only local state.
 */
const SimSlider = ({
  title,
  minimised,
}: {
  title: string;
  minimised: boolean;
}) => {
  const [value, setValue] = useState(0);
  const handleChange = useCallback(
    (_id: SensorStateKey, newValue: number) => setValue(newValue),
    []
  );
  const sensor: RangeSensorType = {
    type: "range",
    id: title,
    value,
    min: 0,
    max: 100,
    unit: 0,
  };
  return (
    <RangeSensor
      id={title as SensorStateKey}
      title={title}
      icon={<Icon as={RiEqualizerLine} color="blimpTeal.400" boxSize="6" />}
      sensor={sensor}
      onSensorChange={handleChange}
      minimised={minimised}
    />
  );
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

export default JacdacSimulatorSection;
