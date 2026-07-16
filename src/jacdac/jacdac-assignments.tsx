/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useAutoShowJacdacOnSensor,
  useEnsureJacdacModules,
  useJacdacSensorServices,
  useParsedRoles,
} from "./jacdac-hooks";

/**
 * Shared role assignments between the Config view (code) and the simulator.
 *
 * Keyed by sensor service (`deviceId:serviceIndex`). A value of "" means the
 * user explicitly chose "No role" (so we don't auto-fill it again). Roles are
 * unique across sensors, so assigning a role held elsewhere swaps it.
 *
 * On connect we auto-link — each connected sensor claims the first unassigned
 * role of its type — so the common case (one of each sensor type) needs no
 * manual clicking; the user then switches any that didn't line up.
 */
interface JacdacAssignmentsValue {
  assignments: Record<string, string>;
  setAssignment: (key: string, roleName: string) => void;
  /** Role names currently backed by a connected sensor. */
  connectedRoleNames: Set<string>;
}

const JacdacAssignmentsContext = createContext<
  JacdacAssignmentsValue | undefined
>(undefined);

export const JacdacAssignmentsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const sensors = useJacdacSensorServices();
  const roles = useParsedRoles();
  // Keep the per-sensor Jacdac modules in the project when the code uses them.
  useEnsureJacdacModules();
  // Reveal the Jacdac sidebar when a sensor is plugged in, to aid discovery.
  useAutoShowJacdacOnSensor(sensors);
  const [assignments, setAssignments] = useState<Record<string, string>>({});

  // Reconcile + auto-link whenever the connected sensors or code roles change.
  useEffect(() => {
    setAssignments((prev) => {
      const validRoles = new Set(roles.map((r) => r.name));
      const connectedKeys = new Set(sensors.map((s) => s.key));
      const next: Record<string, string> = {};
      // Keep existing assignments for still-connected sensors, dropping any
      // whose role has been removed from the code (keep explicit "No role").
      for (const [key, role] of Object.entries(prev)) {
        if (connectedKeys.has(key) && (role === "" || validRoles.has(role))) {
          next[key] = role;
        }
      }
      // Auto-link: give each unassigned connected sensor the first free role of
      // its type.
      const used = new Set(Object.values(next).filter(Boolean));
      for (const s of sensors) {
        if (next[s.key] !== undefined) {
          continue;
        }
        const role = roles.find(
          (r) => r.type === s.supported.type && !used.has(r.name)
        );
        if (role) {
          next[s.key] = role.name;
          used.add(role.name);
        }
      }
      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(next);
      const unchanged =
        prevKeys.length === nextKeys.length &&
        nextKeys.every((k) => prev[k] === next[k]);
      return unchanged ? prev : next;
    });
  }, [sensors, roles]);

  const setAssignment = useCallback((key: string, newRole: string) => {
    setAssignments((prev) => {
      const previousRole = prev[key] ?? "";
      const next = { ...prev };
      if (newRole) {
        const holder = Object.keys(next).find(
          (k) => k !== key && next[k] === newRole
        );
        if (holder) {
          next[holder] = previousRole;
        }
      }
      next[key] = newRole;
      return next;
    });
  }, []);

  const value = useMemo<JacdacAssignmentsValue>(
    () => ({
      assignments,
      setAssignment,
      connectedRoleNames: new Set(Object.values(assignments).filter(Boolean)),
    }),
    [assignments, setAssignment]
  );

  return (
    <JacdacAssignmentsContext.Provider value={value}>
      {children}
    </JacdacAssignmentsContext.Provider>
  );
};

export const useJacdacAssignments = (): JacdacAssignmentsValue => {
  const ctx = useContext(JacdacAssignmentsContext);
  if (!ctx) {
    throw new Error(
      "useJacdacAssignments must be used inside a JacdacAssignmentsProvider"
    );
  }
  return ctx;
};
