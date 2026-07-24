/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDevice } from "../device/device-hooks";
import { SimulatorDeviceConnection } from "../device/simulator";

/**
 * The two possible sources for the shared serial panel.
 */
export type SerialTarget = "device" | "simulator";

interface SerialTargetsContextValue {
  /**
   * The simulator connection, once the simulator has registered it.
   * Distinct from the real device, which is the ambient device context.
   */
  simulator: SimulatorDeviceConnection | undefined;
  /** Called by the Simulator to publish its connection upwards. */
  registerSimulator: (connection: SimulatorDeviceConnection | undefined) => void;
  /**
   * Whether the simulator is a selectable serial source. Becomes true the
   * first time a program is run on the simulator this session.
   */
  simSource: boolean;
  /** The source the user is currently looking at / typing to. */
  activeTarget: SerialTarget;
  setActiveTarget: (target: SerialTarget) => void;
}

const SerialTargetsContext = React.createContext<
  SerialTargetsContextValue | undefined
>(undefined);

export const useSerialTargets = (): SerialTargetsContextValue => {
  const value = useContext(SerialTargetsContext);
  if (!value) {
    throw new Error("Missing SerialTargetsProvider");
  }
  return value;
};

/**
 * Holds the state that lets a single serial panel show either the real
 * device or the simulator.
 *
 * Provided around both the editor's serial panel and the simulator so both
 * can see the simulator connection and the active-target selection. Must be
 * rendered under the app (real device) DeviceContext but outside the
 * simulator's own DeviceContext, so `useDevice()` here is the real device.
 */
export const SerialTargetsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const device = useDevice();
  const [simulator, setSimulator] = useState<
    SimulatorDeviceConnection | undefined
  >(undefined);
  const [simSource, setSimSource] = useState(false);
  const [activeTarget, setActiveTarget] = useState<SerialTarget>("device");

  const registerSimulator = useCallback(
    (connection: SimulatorDeviceConnection | undefined) => {
      setSimulator(connection);
    },
    []
  );

  // Running on the simulator makes it a source and brings it to the front.
  useEffect(() => {
    if (!simulator) {
      return;
    }
    const onFlash = () => {
      setSimSource(true);
      setActiveTarget("simulator");
    };
    simulator.addEventListener("flash", onFlash);
    return () => {
      simulator.removeEventListener("flash", onFlash);
    };
  }, [simulator]);

  // Flashing the real device brings it to the front.
  useEffect(() => {
    const onFlash = () => setActiveTarget("device");
    device.addEventListener("flash", onFlash);
    return () => {
      device.removeEventListener("flash", onFlash);
    };
  }, [device]);

  const value = useMemo(
    () => ({
      simulator,
      registerSimulator,
      simSource,
      activeTarget,
      setActiveTarget,
    }),
    [simulator, registerSimulator, simSource, activeTarget]
  );
  return (
    <SerialTargetsContext.Provider value={value}>
      {children}
    </SerialTargetsContext.Provider>
  );
};
