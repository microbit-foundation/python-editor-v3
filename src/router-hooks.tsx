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

export type TabName = "api" | "ideas" | "reference" | "project";

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

export interface RouterState {
  tab?: TabName;
  slug?: Anchor;
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

const parse = (pathname: string): RouterState => {
  pathname = pathname.slice(baseUrl.length);
  if (pathname) {
    const parts = pathname.split("/");
    const tab = parts[0];
    if (
      tab === "api" ||
      tab === "reference" ||
      tab === "ideas" ||
      tab === "project"
    ) {
      return { tab, slug: anchorForParam(parts[1]) };
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
  const parts = [state.tab, state.slug?.id];
  const pathname = baseUrl + parts.filter((x): x is string => !!x).join("/");
  return window.location.toString().split("/", 1)[0] + pathname;
};

export const RouterProvider = ({ children }: { children: ReactNode }) => {
  const logging = useLogging();
  const [state, setState] = useState(parse(window.location.pathname));
  useEffect(() => {
    // This detects browser navigation but not our programatic changes,
    // so we need to update state there ourselves.
    const listener = (_: PopStateEvent) => {
      const newState = parse(window.location.pathname);
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
        const parts = [newState.tab, newState.slug?.id];
        const message = parts.filter((x): x is string => !!x).join("-");
        logging.event({
          type: source,
          message,
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
 * Access the slug for a particular tab.
 *
 * @param tab The tab name.
 * @returns A [state, setState] pair for the tab.
 */
export const useRouterTabSlug = (
  tab: TabName
): [
  Anchor | undefined,
  (param: Anchor | undefined, source?: NavigationSource) => void
] => {
  const [state, setState] = useRouterState();
  const navigateParam = useCallback(
    (value: Anchor | undefined, source?: NavigationSource) => {
      setState({ ...state, tab, slug: value }, source);
    },
    [tab, setState, state]
  );
  return [state.tab === tab ? state.slug : undefined, navigateParam];
};
