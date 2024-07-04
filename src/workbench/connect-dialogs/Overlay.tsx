/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, useDisclosure } from "@chakra-ui/react";
import { useCallback, useEffect } from "react";
import { zIndexOverlay } from "../../common/zIndex";
import {
  EVENT_END_USB_SELECT,
  EVENT_START_USB_SELECT,
} from "../../device/device";
import { useDevice } from "../../device/device-hooks";

const Overlay = () => {
  const selectingDevice = useDisclosure();
  const device = useDevice();
  const showOverlay = useCallback(() => {
    selectingDevice.onOpen();
  }, [selectingDevice]);
  const hideOverlay = useCallback(() => {
    selectingDevice.onClose();
  }, [selectingDevice]);
  useEffect(() => {
    device.addEventListener(EVENT_START_USB_SELECT, showOverlay);
    device.addEventListener(EVENT_END_USB_SELECT, hideOverlay);
    return () => {
      device.removeEventListener(EVENT_START_USB_SELECT, showOverlay);
      device.removeEventListener(EVENT_END_USB_SELECT, hideOverlay);
    };
  }, [device, showOverlay, hideOverlay]);
  return (
    <Box
      display={selectingDevice.isOpen ? "block" : "none"}
      width="100vw"
      height="100vh"
      background="var(--chakra-colors-blackAlpha-600)"
      position="fixed"
      top={0}
      left={0}
      zIndex={zIndexOverlay}
    />
  );
};

export default Overlay;
