/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import React, { useContext, useEffect, useState } from "react";
import {
  MicrobitWebUSBConnection,
  EVENT_STATUS,
  ConnectionStatus,
} from "./device";

export const DeviceContext = React.createContext<
  undefined | MicrobitWebUSBConnection
>(undefined);

/**
 * Hook to access the device from UI code.
 *
 * @returns The device.
 */
export const useDevice = () => {
  const device = useContext(DeviceContext);
  if (!device) {
    throw new Error("Missing provider.");
  }
  return device;
};

/**
 * State that tracks the device connections status.
 */
export const useConnectionStatus = () => {
  const device = useDevice();
  const [status, setStatus] = useState<ConnectionStatus>(device.status);
  useEffect(() => {
    const statusListener = (status: ConnectionStatus) => {
      setStatus(status);
    };
    device.on(EVENT_STATUS, statusListener);
    return () => {
      device.removeListener(EVENT_STATUS, statusListener);
    };
  }, [device, setStatus]);

  return status;
};
