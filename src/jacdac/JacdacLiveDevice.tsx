/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Grid, IconButton, Select, Text } from "@chakra-ui/react";
import { Fragment } from "react";
import { RiSearchEyeLine } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import JacdacSensorLabel from "./JacdacSensorLabel";
import {
  useJacdacIdentify,
  useJacdacRoles,
  useJacdacSensorServices,
} from "./jacdac-hooks";

/**
 * The "device view" (read-only): the same per-service layout as Config, but the
 * role dropdown shows the role currently assigned on the connected micro:bit's
 * role manager (matched by device id + service index), or "No role", and can't
 * be edited. This is the live device state, separate from the code-driven view.
 */
const JacdacLiveDevice = () => {
  const intl = useIntl();
  const sensors = useJacdacSensorServices();
  const identify = useJacdacIdentify();
  const roles = useJacdacRoles();
  const identifyLabel = intl.formatMessage({ id: "jacdac-identify-action" });

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
        The roles currently assigned on the connected micro:bit (read-only).
      </Text>
      <Grid
        templateColumns="7.5rem minmax(0, 1fr) auto"
        columnGap={3}
        rowGap={4}
        alignItems="center"
      >
        {sensors.map(({ device, service, supported, key }) => {
          const assignedRole =
            roles.find(
              (r) =>
                r.deviceId === device.deviceId &&
                r.serviceIndex === service.serviceIndex
            )?.name ?? "";
          return (
            <Fragment key={key}>
              <JacdacSensorLabel device={device} serviceLabel={supported.label} />
              <Select
                size="sm"
                placeholder="No role"
                value={assignedRole}
                isDisabled
                w="100%"
              >
                {assignedRole && (
                  <option value={assignedRole}>{assignedRole}</option>
                )}
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
          );
        })}
      </Grid>
    </Box>
  );
};

export default JacdacLiveDevice;
