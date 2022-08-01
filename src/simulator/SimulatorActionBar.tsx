/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps, HStack, IconButton } from "@chakra-ui/react";
import { useCallback } from "react";
import { RiPlayFill, RiStopFill } from "react-icons/ri";
import { useSimulator } from "../device/device-hooks";
import { useFileSystem } from "../fs/fs-hooks";

interface SimulatorActionBarProps extends BoxProps {}

const SimulatorActionBar = (props: SimulatorActionBarProps) => {
  const device = useSimulator();
  const fs = useFileSystem();
  const handlePlay = useCallback(async () => {
    device.flash(fs, {
      partial: true,
      progress: () => {},
    });
  }, [device, fs]);
  const size = "md";
  return (
    <HStack {...props} justifyContent="center" spacing={2.5} py={2} px={1}>
      <IconButton
        size={size}
        variant="solid"
        onClick={handlePlay}
        icon={<RiPlayFill />}
        aria-label="Run"
      />
      <IconButton
        size={size}
        variant="outline"
        onClick={device.stop}
        icon={<RiStopFill />}
        aria-label="Stop"
      />
    </HStack>
  );
};

export default SimulatorActionBar;
