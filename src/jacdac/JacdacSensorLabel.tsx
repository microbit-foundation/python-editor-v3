/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Text } from "@chakra-ui/react";
import { deviceCatalog, JDDevice, REPORT_RECEIVE } from "jacdac-ts";
import { useEffect, useReducer } from "react";

// Control service register holding the product identifier (Jacdac spec 0x181).
const PRODUCT_IDENTIFIER_REG = 385;

/**
 * Label for a sensor service row:
 *  - device short id (unique id, used with Identify)
 *  - the service's friendly type ("Button" / "Rotary encoder" / "Slider"),
 *    which distinguishes multiple services on the same device
 *  - the registered product name ("Rotary Button", "Slider", …) for physical
 *    identification, resolved from the bundled device catalog.
 *
 * The product identifier is read from a register asynchronously, so we
 * re-render when its report arrives.
 */
const JacdacSensorLabel = ({
  device,
  serviceLabel,
}: {
  device: JDDevice;
  serviceLabel: string;
}) => {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    const reg = device.service(0)?.register(PRODUCT_IDENTIFIER_REG);
    if (!reg) {
      return;
    }
    reg.scheduleRefresh();
    return reg.subscribe(REPORT_RECEIVE, forceUpdate);
  }, [device]);

  const productName = deviceCatalog.specificationFromProductIdentifier(
    device.productIdentifier
  )?.name;

  return (
    <Box minW={0}>
      <Text fontWeight="semibold" lineHeight="short">
        {device.shortId}
      </Text>
      <Text fontSize="xs" color="gray.700" lineHeight="short">
        {serviceLabel}
      </Text>
      {productName && (
        <Text fontSize="xs" color="gray.500" lineHeight="short">
          {productName}
        </Text>
      )}
    </Box>
  );
};

export default JacdacSensorLabel;
