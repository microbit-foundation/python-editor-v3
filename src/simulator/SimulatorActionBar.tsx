/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps, HStack, IconButton } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import {
  RiPlayFill,
  RiRefreshLine,
  RiStopFill,
  RiVolumeDownFill,
  RiVolumeMuteFill,
} from "react-icons/ri";
import {
  SyncStatus,
  useSimulator,
  useSyncStatus,
} from "../device/device-hooks";
import { useFileSystem } from "../fs/fs-hooks";

interface SimulatorActionBarProps extends BoxProps {}

enum SimState {
  RUNNING,
  STOPPED,
}

const SimulatorActionBar = (props: SimulatorActionBarProps) => {
  const device = useSimulator();
  const fs = useFileSystem();
  const [simState, setSimState] = useState<SimState>(SimState.STOPPED);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const syncStatus = useSyncStatus();
  const handlePlay = useCallback(async () => {
    device.flash(fs, {
      partial: true,
      progress: () => {},
    });
    setSimState(SimState.RUNNING);
  }, [device, fs]);
  const handleStop = useCallback(() => {
    device.stop();
    setSimState(SimState.STOPPED);
  }, [device, setSimState]);
  useEffect(() => {
    if (syncStatus === SyncStatus.OUT_OF_SYNC) {
      handleStop();
    }
  }, [handleStop, syncStatus]);
  const handleMuteUnmute = useCallback(() => {
    if (isMuted) {
      device.unmute();
    } else {
      device.mute();
    }
    setIsMuted(!isMuted);
  }, [device, isMuted, setIsMuted]);
  const size = "md";
  return (
    <HStack {...props} justifyContent="center" spacing={2.5} py={2} px={1}>
      {syncStatus === SyncStatus.OUT_OF_SYNC ||
      simState === SimState.STOPPED ? (
        <IconButton
          size={size}
          variant="outline"
          onClick={handlePlay}
          icon={<RiPlayFill />}
          aria-label="Run"
        />
      ) : (
        <IconButton
          size={size}
          variant="outline"
          onClick={handleStop}
          icon={<RiStopFill />}
          aria-label="Stop"
        />
      )}
      <IconButton
        size={size}
        variant="outline"
        onClick={device.reset}
        icon={<RiRefreshLine />}
        aria-label="Reset"
        disabled={simState === SimState.STOPPED}
      />
      <IconButton
        size={size}
        variant="outline"
        onClick={handleMuteUnmute}
        icon={isMuted ? <RiVolumeDownFill /> : <RiVolumeMuteFill />}
        aria-label={isMuted ? "Unmute" : "Mute"}
      />
    </HStack>
  );
};

export default SimulatorActionBar;
