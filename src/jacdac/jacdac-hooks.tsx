/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  CONNECTION_STATE,
  DEVICE_CHANGE,
  DEVICE_CONNECT,
  DEVICE_DISCONNECT,
  isSensor,
  JDBus,
  JDDevice,
  JDService,
} from "jacdac-ts";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

const JacdacBusContext = createContext<JDBus | undefined>(undefined);

export const JacdacProvider = ({
  bus,
  children,
}: {
  bus: JDBus;
  children: ReactNode;
}) => (
  <JacdacBusContext.Provider value={bus}>{children}</JacdacBusContext.Provider>
);

export const useJacdacBus = (): JDBus => {
  const bus = useContext(JacdacBusContext);
  if (!bus) {
    throw new Error("useJacdacBus must be used inside a JacdacProvider");
  }
  return bus;
};

/** Whether any transport on the bus is currently connected. */
export const useJacdacConnected = (): boolean => {
  const bus = useJacdacBus();
  const [connected, setConnected] = useState<boolean>(bus.connected);
  useEffect(() => {
    setConnected(bus.connected);
    return bus.subscribe(CONNECTION_STATE, () => setConnected(bus.connected));
  }, [bus]);
  return connected;
};

// Compare by object identity, not id: a device restart rebuilds the
// JD* instances, so consumers must adopt the new objects.
const sameItems = <T,>(a: T[], b: T[]) =>
  a.length === b.length && a.every((s, i) => s === b[i]);

/** Live list of announced Jacdac devices on the bus (excluding infrastructure). */
export const useJacdacDevices = (): JDDevice[] => {
  const bus = useJacdacBus();
  const [devices, setDevices] = useState<JDDevice[]>([]);
  useEffect(() => {
    const update = () => {
      const next = bus.devices({ ignoreInfrastructure: true, announced: true });
      setDevices((prev) => (sameItems(prev, next) ? prev : next));
    };
    update();
    return bus.subscribe(
      [DEVICE_CHANGE, DEVICE_CONNECT, DEVICE_DISCONNECT],
      update
    );
  }, [bus]);
  return devices;
};

/** Live list of sensor services on the bus that expose a reading register. */
export const useJacdacSensors = (): JDService[] => {
  const bus = useJacdacBus();
  const [services, setServices] = useState<JDService[]>([]);
  useEffect(() => {
    const update = () => {
      const next = bus
        .services()
        .filter((s) => isSensor(s.specification) && !!s.readingRegister);
      setServices((prev) => (sameItems(prev, next) ? prev : next));
    };
    update();
    return bus.subscribe(
      [DEVICE_CHANGE, DEVICE_CONNECT, DEVICE_DISCONNECT],
      update
    );
  }, [bus]);
  return services;
};
