/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps, HStack, IconButton, useMediaQuery } from "@chakra-ui/react";
import { RiPlayFill, RiStopFill } from "react-icons/ri";
import { widthXl } from "../common/media-queries";

interface SimulatorActionBarProps extends BoxProps {
  onPlay: () => Promise<void>;
  onStop: () => Promise<void>;
}

const SimulatorActionBar = ({
  onPlay,
  onStop,
  ...props
}: SimulatorActionBarProps) => {
  const [isWideScreen] = useMediaQuery(widthXl);
  const size = "lg";
  return (
    <HStack
      {...props}
      justifyContent="center"
      spacing={2.5}
      py={5}
      px={isWideScreen ? 10 : 5}
    >
      <IconButton
        size={size}
        variant="solid"
        onClick={onPlay}
        icon={<RiPlayFill />}
        aria-label="Run"
      />
      <IconButton
        size={size}
        variant="outline"
        onClick={onStop}
        icon={<RiStopFill />}
        aria-label="Stop"
      />
    </HStack>
  );
};

export default SimulatorActionBar;
