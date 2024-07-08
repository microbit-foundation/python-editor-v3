/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, useDisclosure } from "@chakra-ui/react";
import { useCallback, useEffect } from "react";
import { zIndexOverlay } from "../../common/zIndex";
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
    device.addEventListener("start_usb_select", showOverlay);
    device.addEventListener("end_usb_select", hideOverlay);
    return () => {
      device.removeEventListener("start_usb_select", showOverlay);
      device.removeEventListener("end_usb_select", hideOverlay);
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
