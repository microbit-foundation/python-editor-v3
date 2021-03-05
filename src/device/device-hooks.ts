import React, { useContext, useEffect, useState } from "react";
import {
  MicrobitWebUSBConnection,
  EVENT_STATUS,
  ConnectionStatus,
} from "./microbit";

export const DeviceContext = React.createContext<
  undefined | MicrobitWebUSBConnection
>(undefined);

export const useDevice = () => {
  const device = useContext(DeviceContext);
  if (!device) {
    throw new Error("Missing provider.");
  }
  return device;
};

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
