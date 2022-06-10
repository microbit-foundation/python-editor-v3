import { Box } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { zIndexOverlay } from "../../common/zIndex";
import {
  EVENT_END_USB_SELECT,
  EVENT_START_USB_SELECT,
} from "../../device/device";
import { useDevice } from "../../device/device-hooks";

const Overlay = () => {
  const [selectingDevice, setSelectingDevice] = useState<boolean>(false);
  const device = useDevice();
  const showOverlay = useCallback(() => {
    setSelectingDevice(true);
  }, [setSelectingDevice]);
  const hideOverlay = useCallback(() => {
    setSelectingDevice(false);
  }, [setSelectingDevice]);
  useEffect(() => {
    device.on(EVENT_START_USB_SELECT, showOverlay);
    device.on(EVENT_END_USB_SELECT, hideOverlay);
    return () => {
      device.removeListener(EVENT_START_USB_SELECT, showOverlay);
      device.removeListener(EVENT_END_USB_SELECT, hideOverlay);
    };
  }, [device, showOverlay, hideOverlay]);
  return (
    <Box
      display={selectingDevice ? "block" : "none"}
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
