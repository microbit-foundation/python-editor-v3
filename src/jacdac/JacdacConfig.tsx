/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Grid, IconButton, Select, Text } from "@chakra-ui/react";
import { Fragment, useCallback, useState } from "react";
import { RiSearchEyeLine } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import JacdacSensorLabel from "./JacdacSensorLabel";
import {
  useJacdacIdentify,
  useJacdacSensorServices,
  useParsedRoles,
} from "./jacdac-hooks";

/**
 * The "code view" config pane: assign role names (from the user's code) to each
 * connected Jacdac sensor service. A device hosting multiple services (e.g. a
 * rotary encoder + button module) gets a row per service. Only roles whose type
 * matches the service are offered. Role names are unique across all services —
 * assigning a role held elsewhere swaps it (that service inherits the previous
 * role).
 */
const JacdacConfig = () => {
  const intl = useIntl();
  const sensors = useJacdacSensorServices();
  const identify = useJacdacIdentify();
  const roles = useParsedRoles();
  const identifyLabel = intl.formatMessage({ id: "jacdac-identify-action" });

  // Role assignments keyed by service (deviceId:serviceIndex). Local state for
  // now; binding to the sim/device comes in later steps.
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const handleRoleChange = useCallback((key: string, newRole: string) => {
    setAssignments((prev) => {
      const previousRole = prev[key] ?? "";
      const next = { ...prev };
      if (newRole) {
        const holder = Object.keys(next).find(
          (k) => k !== key && next[k] === newRole
        );
        if (holder) {
          next[holder] = previousRole;
        }
      }
      next[key] = newRole;
      return next;
    });
  }, []);

  if (sensors.length === 0) {
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
        templateColumns="7.5rem minmax(0, 1fr) auto"
        columnGap={3}
        rowGap={4}
        alignItems="center"
      >
        {sensors.map(({ device, supported, key }) => (
          <Fragment key={key}>
            <JacdacSensorLabel device={device} serviceLabel={supported.label} />
            <Select
              size="sm"
              placeholder="No role"
              value={assignments[key] ?? ""}
              onChange={(e) => handleRoleChange(key, e.target.value)}
              w="100%"
            >
              {roles
                .filter((r) => r.type === supported.type)
                .map((r) => (
                  <option key={r.name} value={r.name}>
                    {r.name}
                  </option>
                ))}
            </Select>
            <IconButton
              size="sm"
              variant="outline"
              aria-label={identifyLabel}
              title={identifyLabel}
              icon={<RiSearchEyeLine />}
              onClick={() => void identify(device.deviceId)}
            />
          </Fragment>
        ))}
      </Grid>
    </Box>
  );
};

export default JacdacConfig;
