/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps, HStack, IconButton } from "@chakra-ui/react";
import { useCallback } from "react";
import { RiPlayFill, RiStopFill } from "react-icons/ri";
import HideSplitViewButton from "../common/SplitView/HideSplitViewButton";
import { useSimulator } from "../device/device-hooks";
import { useFileSystem } from "../fs/fs-hooks";
import { flags } from "../flags";

interface SimulatorActionBarProps extends BoxProps {
  handleHideSimulator: () => void;
  handleShowSimulator: () => void;
  simulatorShown: boolean;
}

const SimulatorActionBar = ({
  handleHideSimulator,
  handleShowSimulator,
  simulatorShown,
  ...props
}: SimulatorActionBarProps) => {
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
    <HStack
      {...props}
      justifyContent="center"
      spacing={2.5}
      py={2}
      px={1}
      position="relative"
    >
      {flags.showAlternative && (
        <HideSplitViewButton
          handleClick={handleHideSimulator}
          handleShowSimulator={handleShowSimulator}
          simulatorShown={simulatorShown}
          simulatorButton={true}
          aria-label="Hide simulator"
          direction="right"
          left="-15px"
        />
      )}
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
