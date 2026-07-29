/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useCallback, useEffect, useState } from "react";
import { Box } from "styled-system/jsx";
import { token } from "styled-system/tokens";
import { useDevice } from "../../device/device-hooks";

const Overlay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const device = useDevice();
  const showOverlay = useCallback(() => setIsOpen(true), []);
  const hideOverlay = useCallback(() => setIsOpen(false), []);
  useEffect(() => {
    device.addEventListener("beforerequestdevice", showOverlay);
    device.addEventListener("afterrequestdevice", hideOverlay);
    return () => {
      device.removeEventListener("beforerequestdevice", showOverlay);
      device.removeEventListener("afterrequestdevice", hideOverlay);
    };
  }, [device, showOverlay, hideOverlay]);
  return (
    <Box
      display={isOpen ? "block" : "none"}
      width="100vw"
      height="100vh"
      bg="blackAlpha.600"
      position="fixed"
      top="0"
      left="0"
      // Numeric z-index constant calibrated against third-party stacking; a
      // runtime value, so set it via inline style (Panda can't extract it).
      style={{ zIndex: token("zIndex.overlay") }}
    />
  );
};

export default Overlay;
