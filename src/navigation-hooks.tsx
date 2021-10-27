import { useCallback, useEffect, useState } from "react";

export interface NavigationState {
  tab?: string;
  advanced?: string;
}

const parse = (search: string): NavigationState => {
  const params = new URLSearchParams(search);
  return {
    tab: params.get("tab") ?? undefined,
    advanced: params.get("advanced") ?? undefined,
    // other tabs will get state here in time, as well as the active file
  };
};

const useNavigationState = (): [
  NavigationState,
  (state: NavigationState) => void
] => {
  const [state, setState] = useState(parse(window.location.search));
  useEffect(() => {
    const listener = (_: PopStateEvent) => {
      setState(parse(window.location.search));
    };
    window.addEventListener("popstate", listener);
    return () => {
      window.removeEventListener("popstate", listener);
    };
  }, []);
  const navigate = useCallback(
    (state: NavigationState) => {
      const query = Object.entries(state)
        .filter(([_, v]) => !!v)
        .map(([k, v]) => {
          return `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
        })
        .join("&");
      setState(state);
      const url =
        window.location.toString().split("?")[0] + (query ? "?" + query : "");
      window.history.pushState(state, "", url);
    },
    [setState]
  );

  return [state, navigate];
};

export const useNavigationParameter = (
  param: keyof NavigationState
): [string | undefined, (param: string | undefined) => void] => {
  const [state, setState] = useNavigationState();
  const navigateParam = useCallback(
    (value: string | undefined) => {
      setState({ ...state, [param]: value });
    },
    [param, state, setState]
  );
  return [state[param], navigateParam];
};

export default useNavigationState;
