/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Grid, IconButton, Select, Text } from "@chakra-ui/react";
import { deviceCatalog, JDDevice, REPORT_RECEIVE } from "jacdac-ts";
import { useCallback, useEffect, useReducer, useState } from "react";
import { RiSearchEyeLine } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import {
  useJacdacDevices,
  useJacdacIdentify,
  useParsedRoles,
} from "./jacdac-hooks";

// Control service register holding the product identifier (Jacdac spec 0x181).
const PRODUCT_IDENTIFIER_REG = 385;

/**
 * A friendly label for a device: its registered product name (e.g. "Rotary
 * Button", "Slider") from the bundled Jacdac device catalog, falling back to
 * its service type names for unregistered devices.
 */
const deviceLabel = (device: JDDevice): string => {
  const productName = deviceCatalog.specificationFromProductIdentifier(
    device.productIdentifier
  )?.name;
  if (productName) {
    return productName;
  }
  return (
    device
      .services()
      .filter((s) => s.serviceIndex !== 0)
      .map((s) => s.name)
      .join(", ") || "—"
  );
};

interface JacdacConfigRowProps {
  device: JDDevice;
  roleNames: string[];
  role: string;
  onRoleChange: (role: string) => void;
  identifyLabel: string;
  onIdentify: () => void;
}

const JacdacConfigRow = ({
  device,
  roleNames,
  role,
  onRoleChange,
  identifyLabel,
  onIdentify,
}: JacdacConfigRowProps) => {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    // productIdentifier is read from a register asynchronously; re-render when
    // its report arrives so the friendly product name replaces the fallback.
    const reg = device.service(0)?.register(PRODUCT_IDENTIFIER_REG);
    if (!reg) {
      return;
    }
    reg.scheduleRefresh();
    return reg.subscribe(REPORT_RECEIVE, forceUpdate);
  }, [device]);

  return (
    <>
      <Box minW={0}>
        <Text fontWeight="semibold" lineHeight="short">
          {device.shortId}
        </Text>
        <Text fontSize="xs" color="gray.600" lineHeight="short">
          {deviceLabel(device)}
        </Text>
      </Box>
      <Select
        size="sm"
        placeholder="No role"
        value={role}
        onChange={(e) => onRoleChange(e.target.value)}
        w="100%"
      >
        {roleNames.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </Select>
      <IconButton
        size="sm"
        variant="outline"
        aria-label={identifyLabel}
        title={identifyLabel}
        icon={<RiSearchEyeLine />}
        onClick={onIdentify}
      />
    </>
  );
};

/**
 * The "code view" config pane: assign role names (from the user's code) to the
 * connected Jacdac sensors, and identify which physical sensor is which.
 *
 * Step 4: role dropdowns are stubbed (empty/disabled) until code parsing lands
 * (step 5). Identify is wired up and works today.
 */
const JacdacConfig = () => {
  const intl = useIntl();
  const devices = useJacdacDevices();
  const identify = useJacdacIdentify();
  const roleNames = useParsedRoles().map((r) => r.name);
  const identifyLabel = intl.formatMessage({ id: "jacdac-identify-action" });

  // Role assignments keyed by device id. Role names are unique across sensors,
  // so assigning a role already held by another sensor swaps: that other sensor
  // inherits this one's previous role (which may be "no role").
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const handleRoleChange = useCallback(
    (deviceId: string, newRole: string) => {
      setAssignments((prev) => {
        const previousRole = prev[deviceId] ?? "";
        const next = { ...prev };
        if (newRole) {
          const holder = Object.keys(next).find(
            (id) => id !== deviceId && next[id] === newRole
          );
          if (holder) {
            next[holder] = previousRole;
          }
        }
        next[deviceId] = newRole;
        return next;
      });
    },
    []
  );

  if (devices.length === 0) {
    return (
      <Text p={5} fontSize="sm" color="gray.700">
        <FormattedMessage id="jacdac-no-sensors" />
      </Text>
    );
  }

  return (
    <Box p={5}>
      <Text fontSize="sm" color="gray.700" mb={4}>
        Assign a role name (from your code) to each connected Jacdac sensor.
      </Text>
      <Grid
        templateColumns="6rem minmax(0, 1fr) auto"
        columnGap={3}
        rowGap={4}
        alignItems="center"
      >
        {devices.map((device) => (
          <JacdacConfigRow
            key={device.id}
            device={device}
            roleNames={roleNames}
            role={assignments[device.id] ?? ""}
            onRoleChange={(newRole) => handleRoleChange(device.id, newRole)}
            identifyLabel={identifyLabel}
            onIdentify={() => void identify(device.deviceId)}
          />
        ))}
      </Grid>
    </Box>
  );
};

export default JacdacConfig;
