/**
 * A simple custom router. We don't have pages as such, but the different UI areas
 * use query parameters to keep some state, for example to allow navigating back from
 * drilling down into the documentation in the side panel or making tab selections.
 *
 * Which UI state is encoded into the URL might be subject to change in future
 * based on user feedback and discussion.
 *
 * (c) 2021, Micro:bit Educational Foundation and contributors
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

export interface RouterState {
  tab?: string;
  advanced?: string;
}

type RouterContextValue = [RouterState, (state: RouterState) => void];

const RouterContext = createContext<RouterContextValue | undefined>(undefined);

const parse = (search: string): RouterState => {
  const params = new URLSearchParams(search);
  return {
    tab: params.get("tab") ?? undefined,
    advanced: params.get("advanced") ?? undefined,
    // other tabs will get state here in time, as well as the active file
  };
};

const useRouterState = (): RouterContextValue => {
  const value = useContext(RouterContext);
  if (!value) {
    throw new Error("Missing provider!");
  }
  return value;
};

export const RouterProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState(parse(window.location.search));
  useEffect(() => {
    // This detects browser navigation but not our programatic changes,
    // so we need to update state there ourselves.
    const listener = (_: PopStateEvent) => {
      const newState = parse(window.location.search);
      setState(newState);
    };
    window.addEventListener("popstate", listener);
    return () => {
      window.removeEventListener("popstate", listener);
    };
  }, [setState]);
  const navigate = useCallback(
    (newState: RouterState) => {
      const query = Object.entries(newState)
        .filter(([_, v]) => !!v)
        .map(([k, v]) => {
          return `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
        })
        .join("&");
      const url =
        window.location.toString().split("?")[0] + (query ? "?" + query : "");
      window.history.pushState(newState, "", url);

      console.log("Set state via navigate to ", newState);
      setState(newState);
    },
    [setState]
  );
  const value: RouterContextValue = useMemo(() => {
    return [state, navigate];
  }, [state, navigate]);
  return (
    <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
  );
};

export const useRouterParam = (
  param: keyof RouterState
): [string | undefined, (param: string | undefined) => void] => {
  const [state, setState] = useRouterState();
  const navigateParam = useCallback(
    (value: string | undefined) => {
      console.log("Updating parameter to ", value, " others", state);
      setState({ ...state, [param]: value });
    },
    [param, setState, state]
  );
  return [state[param], navigateParam];
};
