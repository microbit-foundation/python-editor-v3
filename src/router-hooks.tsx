/**
 * A simple custom router. We don't have pages as such, but the different UI areas
 * use query parameters to keep some state, for example to allow navigating back from
 * drilling down into the documentation in the side panel or making tab selections.
 *
 * Which UI state is encoded into the URL might be subject to change in future
 * based on user feedback and discussion.
 *
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
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
import { baseUrl } from "./base";
import { useLogging } from "./logging/logging-hooks";

/**
 * An anchor-like navigation used for scroll positions.
 *
 * We sync to on first load, allow drift when you scroll, and, importantly,
 * will scroll again if you set a new anchor with the same id.
 */
export interface Anchor {
  id: string;
}
const anchorForParam = (param: string | null): Anchor | undefined =>
  param ? { id: param } : undefined;

export class RouterParam<T> {
  static tab: RouterParam<string> = new RouterParam("tab");
  static api: RouterParam<Anchor> = new RouterParam("api");
  static reference: RouterParam<Anchor> = new RouterParam("reference");
  static idea: RouterParam<Anchor> = new RouterParam("idea");

  private constructor(public id: keyof RouterState) {}

  get(state: RouterState): T | undefined {
    // Constructor is private so this is safe.
    return state[this.id] as unknown as T | undefined;
  }
}

export interface RouterState {
  tab?: string;
  reference?: Anchor;
  api?: Anchor;
  idea?: Anchor;
  focus?: boolean;
}

type NavigationSource =
  | "documentation-user"
  | "documentation-search"
  | "documentation-from-code"
  | "documentation-from-simulator";

type RouterContextValue = [
  RouterState,
  (state: RouterState, source?: NavigationSource) => void
];

const RouterContext = createContext<RouterContextValue | undefined>(undefined);

const parse = (pathname: string, search: string): RouterState => {
  pathname = pathname.slice(baseUrl.length);
  if (pathname) {
    const parts = pathname.split("/");
    const tab = parts[0];
    switch (tab) {
      case "api":
        return { tab: "api", api: anchorForParam(parts[1]) };
      case "reference":
        return { tab: "reference", reference: anchorForParam(parts[1]) };
      case "idea":
        return { tab: "ideas", idea: anchorForParam(parts[1]) };
      default:
        return { tab };
    }
  }
  return {};
};

/**
 * The full router state.
 * Consider using useRouterParam instead if you only care about one parameter.
 *
 * Updating the state updates the URL.
 *
 * @return a [state, setState] pair.
 */
export const useRouterState = (): RouterContextValue => {
  const value = useContext(RouterContext);
  if (!value) {
    throw new Error("Missing provider!");
  }
  return value;
};

export const toUrl = (state: RouterState): string => {
  // This could be cleaned up if we always set the tab.
  const parts = [
    state.tab ??
      (state.tab === "api" || state.api ? "api" : undefined) ??
      (state.reference ? "reference" : undefined) ??
      (state.idea ? "ideas" : undefined),
    state.api?.id ?? state.reference?.id ?? state.idea?.id,
  ];
  const pathname = baseUrl + parts.filter((x): x is string => !!x).join("/");
  return window.location.toString().split("/", 1)[0] + pathname;
};

export const RouterProvider = ({ children }: { children: ReactNode }) => {
  const logging = useLogging();
  const [state, setState] = useState(
    parse(window.location.pathname, window.location.search)
  );
  useEffect(() => {
    // This detects browser navigation but not our programatic changes,
    // so we need to update state there ourselves.
    const listener = (_: PopStateEvent) => {
      const newState = parse(window.location.pathname, window.location.search);
      setState(newState);
    };
    window.addEventListener("popstate", listener);
    return () => {
      window.removeEventListener("popstate", listener);
    };
  }, [setState]);
  const navigate = useCallback(
    (newState: RouterState, source?: NavigationSource) => {
      if (source) {
        logging.event({
          type: source,
          message:
            (newState.reference?.id && `reference-${newState.reference?.id}`) ||
            (newState.api?.id && `api-${newState.api?.id}`) ||
            (newState.idea?.id && `ideas-${newState.idea?.id}`),
        });
      }
      const url = toUrl(newState);
      window.history.pushState(newState, "", url);

      setState(newState);
    },
    [logging, setState]
  );
  const value: RouterContextValue = useMemo(() => {
    return [state, navigate];
  }, [state, navigate]);
  return (
    <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
  );
};

/**
 * Access a single parameter of the router state.
 * All other parameters will remain unchanged if you set this parameter.
 *
 * @param param The parameter name.
 * @returns A [state, setState] pair for the parameter.
 */
export const useRouterParam = <T,>(
  param: RouterParam<T>
): [
  T | undefined,
  (param: T | undefined, source?: NavigationSource) => void
] => {
  const [state, setState] = useRouterState();
  const navigateParam = useCallback(
    (value: T | undefined, source?: NavigationSource) => {
      setState({ ...state, [param.id]: value }, source);
    },
    [param, setState, state]
  );
  return [param.get(state), navigateParam];
};
