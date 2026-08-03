/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Box,
  Grid,
  HStack,
  IconButton,
  Select,
  Text,
  VStack,
} from "@chakra-ui/react";
import { JDDevice } from "jacdac-ts";
import { Fragment } from "react";
import { RiSearchEyeLine } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { useJacdacAssignments } from "./jacdac-assignments";
import JacdacSensorLabel from "./JacdacSensorLabel";
import {
  JacdacSensorService,
  useJacdacIdentify,
  useJacdacSensorServices,
  useParsedRoles,
} from "./jacdac-hooks";

/**
 * The "code view" config pane: assign role names (from the user's code) to each
 * connected Jacdac sensor service. Services are grouped by physical device — a
 * device hosting multiple services (e.g. a rotary encoder + button module) shows
 * one header with its services listed beneath, so it reads as one thing. Only
 * roles whose type matches the service are offered. Role names are unique across
 * all services — assigning a role held elsewhere swaps it.
 */
interface DeviceGroup {
  device: JDDevice;
  services: JacdacSensorService[];
}

const groupByDevice = (sensors: JacdacSensorService[]): DeviceGroup[] => {
  const groups = new Map<string, DeviceGroup>();
  for (const sensor of sensors) {
    const existing = groups.get(sensor.device.deviceId);
    if (existing) {
      existing.services.push(sensor);
    } else {
      groups.set(sensor.device.deviceId, {
        device: sensor.device,
        services: [sensor],
      });
    }
  }
  return [...groups.values()];
};

const JacdacConfig = () => {
  const intl = useIntl();
  const sensors = useJacdacSensorServices();
  const identify = useJacdacIdentify();
  const roles = useParsedRoles();
  const { assignments, setAssignment } = useJacdacAssignments();
  const identifyLabel = intl.formatMessage({ id: "jacdac-identify-action" });

  if (sensors.length === 0) {
    return (
      <Text p={5} fontSize="sm" color="gray.700">
        <FormattedMessage id="jacdac-no-sensors" />
      </Text>
    );
  }

  const devices = groupByDevice(sensors);

  return (
    <Box p={5}>
      <Text fontSize="sm" color="gray.700" mb={4}>
        Assign a role name (from your code) to each connected Jacdac sensor.
      </Text>
      <VStack align="stretch" spacing={4}>
        {devices.map(({ device, services }) => (
          <Box
            key={device.deviceId}
            borderWidth={1}
            borderColor="gray.200"
            borderRadius="md"
            p={3}
          >
            <HStack justifyContent="space-between" alignItems="flex-start" mb={3}>
              <JacdacSensorLabel device={device} />
              <IconButton
                size="sm"
                variant="outline"
                aria-label={identifyLabel}
                title={identifyLabel}
                icon={<RiSearchEyeLine />}
                onClick={() => void identify(device.deviceId)}
              />
            </HStack>
            <Grid
              templateColumns="7.5rem minmax(0, 1fr)"
              columnGap={3}
              rowGap={3}
              alignItems="center"
            >
              {services.map(({ supported, key }) => (
                <Fragment key={key}>
                  <Text fontSize="sm">{supported.label}</Text>
                  <Select
                    size="sm"
                    placeholder="No role"
                    value={assignments[key] ?? ""}
                    onChange={(e) => setAssignment(key, e.target.value)}
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
                </Fragment>
              ))}
            </Grid>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default JacdacConfig;
