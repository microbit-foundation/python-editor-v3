/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { IconButton } from "@microbit/ui";
import { useCallback, useEffect, useState } from "react";
import {
  RiRefreshLine,
  RiStopFill,
  RiVolumeMuteFill,
  RiVolumeUpFill,
} from "react-icons/ri";
import { useIntl } from "react-intl";
import { styled } from "styled-system/jsx";
import { SystemStyleObject } from "styled-system/types";
import {
  SyncStatus,
  useSimulator,
  useSyncStatus,
} from "../device/device-hooks";
import { useFileSystem } from "../fs/fs-hooks";
import { useLogging } from "../logging/logging-hooks";
import { RunningStatus } from "./Simulator";

interface SimulatorActionBarProps {
  running: RunningStatus;
  onRunningChange: (running: RunningStatus) => void;
  "aria-label"?: string;
  css?: SystemStyleObject;
}

const SimulatorActionBar = ({
  running,
  onRunningChange,
  css: cssProp,
  ...props
}: SimulatorActionBarProps) => {
  const device = useSimulator();
  const fs = useFileSystem();
  const intl = useIntl();
  const logging = useLogging();
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const syncStatus = useSyncStatus();
  const handlePlay = useCallback(async () => {
    const files = await fs.files();
    await device.flashFileSystem(files);
    onRunningChange(RunningStatus.RUNNING);
  }, [device, fs, onRunningChange]);
  const handleStop = useCallback(
    (source: "user" | "code") => {
      device.stop();
      onRunningChange(RunningStatus.STOPPED);
      if (source === "user") {
        logging.event({
          type: "sim_stop",
        });
      }
    },
    [device, logging, onRunningChange]
  );
  useEffect(() => {
    if (syncStatus === SyncStatus.OUT_OF_SYNC) {
      handleStop("code");
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
  useEffect(() => {
    device.addEventListener("requestflash", handlePlay);
    return () => {
      device.removeEventListener("requestflash", handlePlay);
    };
  }, [device, handlePlay]);
  const size = "md";
  return (
    <styled.section
      {...props}
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap="2.5"
      py="2"
      px="1"
      css={cssProp}
    >
      <IconButton
        size={size}
        variant="secondary"
        onPress={() => handleStop("user")}
        aria-label={intl.formatMessage({ id: "simulator-stop" })}
        isDisabled={running === RunningStatus.STOPPED}
      >
        <RiStopFill />
      </IconButton>
      <IconButton
        size={size}
        variant="secondary"
        onPress={device.reset}
        aria-label={intl.formatMessage({ id: "simulator-reset" })}
        isDisabled={running === RunningStatus.STOPPED}
      >
        <RiRefreshLine />
      </IconButton>
      <IconButton
        size={size}
        variant="secondary"
        onPress={handleMuteUnmute}
        aria-label={
          isMuted
            ? intl.formatMessage({ id: "simulator-unmute" })
            : intl.formatMessage({ id: "simulator-mute" })
        }
      >
        {isMuted ? <RiVolumeMuteFill /> : <RiVolumeUpFill />}
      </IconButton>
    </styled.section>
  );
};

export default SimulatorActionBar;
