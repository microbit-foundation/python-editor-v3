/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  CHANGE,
  CONNECTION_STATE,
  DEVICE_CHANGE,
  DEVICE_CONNECT,
  DEVICE_DISCONNECT,
  isSensor,
  JDBus,
  JDDevice,
  JDService,
  Role,
  ROLE_MANAGER_CHANGE,
} from "jacdac-ts";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { MAIN_FILE, VersionAction } from "../fs/fs";
import { useFileSystem } from "../fs/fs-hooks";
import { extractModuleData } from "../fs/fs-util";
import { useRouterState } from "../router-hooks";
import { parseRoles, ParsedRole } from "./parse-roles";
import { JACDAC_MODULES } from "./python/module-source";
import { SupportedService, supportedServiceByClass } from "./supported-services";

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

/**
 * Live list of roles held by the device's role manager (read from flash over
 * the bus). Empty when no board / role manager is present.
 */
export const useJacdacRoles = (): Role[] => {
  const bus = useJacdacBus();
  const [roles, setRoles] = useState<Role[]>([]);
  useEffect(() => {
    let unsubClient: (() => void) | undefined;
    // The role manager appears/disappears with the board (ROLE_MANAGER_CHANGE);
    // its own CHANGE fires once roles have been read back from the device.
    const resubscribe = () => {
      unsubClient?.();
      unsubClient = undefined;
      const rm = bus.roleManager;
      const update = () => setRoles(rm ? [...rm.roles] : []);
      update();
      unsubClient = rm?.subscribe(CHANGE, update);
    };
    resubscribe();
    const unsubBus = bus.subscribe(ROLE_MANAGER_CHANGE, resubscribe);
    return () => {
      unsubBus();
      unsubClient?.();
    };
  }, [bus]);
  return roles;
};

/**
 * Returns a callback that blinks a device's status LED (Jacdac identify), so
 * the user can tell which physical sensor a role/config entry maps to.
 */
export const useJacdacIdentify = (): ((deviceId: string) => Promise<void>) => {
  const bus = useJacdacBus();
  return useCallback(
    (deviceId: string) =>
      bus.device(deviceId, true)?.identify() ?? Promise.resolve(),
    [bus]
  );
};

/**
 * Keep the Jacdac sensor modules (JacdacButton.py, etc.) in sync with the user's
 * code: add a module file whenever the code uses that class (so the import
 * resolves in the simulator and the user can read it), and remove it again once
 * the code no longer references the class. Only used modules are present, keeping
 * the flat filesystem lean. Added/removed as micro:bit module files.
 *
 * Removal is guarded by the magic module comment: we only delete a file we
 * recognise as our own module (matching class name), so a user's own same-named
 * file is left untouched. This does mean edits to an added module file are lost
 * if the last reference is removed.
 */
export const useEnsureJacdacModules = (): void => {
  const fs = useFileSystem();
  useEffect(() => {
    let cancelled = false;
    const ensure = async () => {
      try {
        if (!(await fs.exists(MAIN_FILE))) {
          return;
        }
        const text = new TextDecoder().decode((await fs.read(MAIN_FILE)).data);
        for (const module of JACDAC_MODULES) {
          if (cancelled) {
            return;
          }
          const used = new RegExp(`\\b${module.className}\\b`).test(text);
          const filename = `${module.className}.py`;
          const exists = await fs.exists(filename);
          if (used && !exists) {
            await fs.write(filename, module.source, VersionAction.INCREMENT);
          } else if (!used && exists) {
            const existing = new TextDecoder().decode(
              (await fs.read(filename)).data
            );
            if (extractModuleData(existing)?.name === module.className) {
              await fs.remove(filename);
            }
          }
        }
      } catch {
        // Ignore; best-effort convenience.
      }
    };
    void ensure();
    fs.addEventListener("file_text_updated", ensure);
    fs.addEventListener("project_updated", ensure);
    return () => {
      cancelled = true;
      fs.removeEventListener("file_text_updated", ensure);
      fs.removeEventListener("project_updated", ensure);
    };
  }, [fs]);
};

/**
 * Jacdac roles parsed from the user's code (main.py), refreshed as the code
 * changes. The user's code is the source of truth for role names.
 */
export const useParsedRoles = (): ParsedRole[] => {
  const fs = useFileSystem();
  const [roles, setRoles] = useState<ParsedRole[]>([]);
  useEffect(() => {
    let cancelled = false;
    const update = async () => {
      let text = "";
      try {
        if (await fs.exists(MAIN_FILE)) {
          const { data } = await fs.read(MAIN_FILE);
          text = new TextDecoder().decode(data);
        }
      } catch {
        // Ignore read errors; treat as no roles.
      }
      if (!cancelled) {
        setRoles(parseRoles(text));
      }
    };
    void update();
    fs.addEventListener("file_text_updated", update);
    fs.addEventListener("project_updated", update);
    return () => {
      cancelled = true;
      fs.removeEventListener("file_text_updated", update);
      fs.removeEventListener("project_updated", update);
    };
  }, [fs]);
  return roles;
};

/**
 * One entry per supported sensor service across all connected devices. A device
 * hosting multiple supported services (e.g. a rotary encoder + button module)
 * yields multiple entries. Excludes infrastructure and unsupported services.
 */
export interface JacdacSensorService {
  device: JDDevice;
  service: JDService;
  supported: SupportedService;
  /** Stable key across renders: hardware device id + service index. */
  key: string;
}

export const useJacdacSensorServices = (): JacdacSensorService[] => {
  const bus = useJacdacBus();
  const [items, setItems] = useState<JacdacSensorService[]>([]);
  useEffect(() => {
    const update = () => {
      const next: JacdacSensorService[] = [];
      for (const device of bus.devices({
        ignoreInfrastructure: true,
        announced: true,
      })) {
        for (const service of device.services()) {
          const supported = supportedServiceByClass(service.serviceClass);
          if (supported) {
            next.push({
              device,
              service,
              supported,
              key: `${device.deviceId}:${service.serviceIndex}`,
            });
          }
        }
      }
      setItems((prev) =>
        prev.length === next.length &&
        prev.every((p, i) => p.service === next[i].service)
          ? prev
          : next
      );
    };
    update();
    return bus.subscribe(
      [DEVICE_CHANGE, DEVICE_CONNECT, DEVICE_DISCONNECT],
      update
    );
  }, [bus]);
  return items;
};

/**
 * Auto-show the Jacdac sidebar (its top-level list of connected sensors) whenever
 * a new sensor is plugged in, to aid discoverability of what's just become
 * available — something the simulator can't offer as it only shows sensors
 * referenced in the code. Entering the tab plays a slide-in animation (see
 * JacdacArea); we deliberately land on the overview rather than a single sensor
 * so plugging in a whole board shows everything at once.
 */
export const useAutoShowJacdacOnSensor = (
  sensors: JacdacSensorService[]
): void => {
  const [, setParams] = useRouterState();
  // Initialised to the sensors present at mount so we don't navigate on load.
  const previousKeys = useRef<Set<string>>(new Set(sensors.map((s) => s.key)));
  useEffect(() => {
    const added = sensors.some((s) => !previousKeys.current.has(s.key));
    previousKeys.current = new Set(sensors.map((s) => s.key));
    if (added) {
      setParams({ tab: "jacdac" });
    }
  }, [sensors, setParams]);
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
