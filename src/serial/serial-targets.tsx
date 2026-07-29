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
import { SimulatorDeviceConnection } from "../device/simulator";

/**
 * The two possible sources for the stacked serial areas.
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
   * Whether the simulator is a serial source. Becomes true the first time a
   * program is run on the simulator this session, and is what makes the sim
   * serial area appear (stacked under the device one).
   */
  simSource: boolean;
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
 * Holds the shared simulator connection so the stacked serial areas next to
 * the editor can show the simulator REPL underneath the real device one.
 *
 * Provided around both the editor's serial areas and the simulator so both
 * can see the simulator connection. Must be rendered outside the simulator's
 * own DeviceContext.
 */
export const SerialTargetsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [simulator, setSimulator] = useState<
    SimulatorDeviceConnection | undefined
  >(undefined);
  const [simSource, setSimSource] = useState(false);

  const registerSimulator = useCallback(
    (connection: SimulatorDeviceConnection | undefined) => {
      setSimulator(connection);
    },
    []
  );

  // Running on the simulator makes it a serial source (from then on its serial
  // area is available). We never auto-expand it - that's left to the user.
  useEffect(() => {
    if (!simulator) {
      return;
    }
    const onFlash = () => setSimSource(true);
    simulator.addEventListener("flash", onFlash);
    return () => {
      simulator.removeEventListener("flash", onFlash);
    };
  }, [simulator]);

  const value = useMemo(
    () => ({
      simulator,
      registerSimulator,
      simSource,
    }),
    [simulator, registerSimulator, simSource]
  );
  return (
    <SerialTargetsContext.Provider value={value}>
      {children}
    </SerialTargetsContext.Provider>
  );
};
